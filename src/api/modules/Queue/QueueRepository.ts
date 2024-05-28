import {
	HttpException,
	SYSTEM_ERRORS,
	SocketUrls,
	errorHandler,
} from "@core/index";
import { getTodayAndNextTo } from "@utils/index";
import { GlobalSocket } from "app";
import { Request, Response } from "express";
import { BarbersModel, IBarberDocument } from "../Barbers";
import { ServicesModel } from "../Services";
import { ITicketsDocument, TicketsModel } from "../Tickets";
import { IUserDocument } from "../Users";
import { IWorkerDocument } from "../Workers";
import { QueueModel } from "./QueueSchema";

class QueueRepository {
	async index(req: Request, res: Response) {
		try {
			const queues = await QueueModel.find();

			return res.status(200).json(queues);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async create(req: Request, res: Response) {
		try {
			const worker: IUserDocument = res.locals.worker;
			const barber: IBarberDocument = res.locals.barber;

			const { today, nextDay } = getTodayAndNextTo(1);

			const hasCreatedQueueToday = await QueueModel.findOne({
				createdAt: {
					$gte: today,
					$lt: nextDay,
				},
			});

			if (hasCreatedQueueToday) {
				throw new HttpException(
					400,
					SYSTEM_ERRORS.QUEUE_CAN_CREATE_ONLY_ONE_PER_DAY
				);
			}

			const newQueue = await QueueModel.create({
				barber: barber._id,
				workers: [worker._id],
			});

			// Update barber live info
			await BarbersModel.updateLiveInfo(barber._id.toString(), {
				queue: newQueue,
			});

			return res.status(201).json({ queue: newQueue });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async getTodayQueue(req: Request, res: Response) {
		try {
			const barber: IBarberDocument = res.locals.barber;

			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const nextDay = new Date(today);
			nextDay.setDate(today.getDate() + 1);

			const queue = await QueueModel.findOne({
				barber: barber._id,
				status: { $in: ["on", "paused"] },
				createdAt: {
					$gte: today,
					$lt: nextDay,
				},
			});

			await queue?.populateAll();

			return res.status(200).json({ queue });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async getBarberTodayQueue(req: Request, res: Response) {
		try {
			const { barberId } = req.params;

			const barber = await BarbersModel.findById(barberId);

			if (!barber) {
				return new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			const { nextDay, today } = getTodayAndNextTo(1);

			const queue = await QueueModel.findOne({
				barber: barber._id,
				status: { $in: ["on", "paused"] },
				createdAt: {
					$gte: today,
					$lt: nextDay,
				},
			});

			await queue?.populateAll();

			return res.status(200).json({ queue });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async userJoinQueue(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const { code, serviceId } = req.body;

			const service = await ServicesModel.findById(serviceId);

			if (!service) {
				throw new HttpException(400, SYSTEM_ERRORS.SERVICE_NOT_FOUND);
			}

			const barber = await BarbersModel.findOne({ code });

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			if (!barber.open) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_IS_CLOSED);
			}

			const queue = await QueueModel.findBarberTodayQueue(
				barber._id.toString()
			);

			if (!queue) {
				throw new HttpException(400, SYSTEM_ERRORS.QUEUE_NOT_FOUND);
			}

			// Check if user is already in queue
			await queue.populate("tickets");

			const isUserInQueue = queue.tickets.some(
				(ticket: any) =>
					(ticket as ITicketsDocument).customer._id.toString() ===
					user._id.toString()
			);

			if (isUserInQueue) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_ALREADY_IN_QUEUE);
			}
			// Check if user is already a customer in barber
			const isCustomer = barber.customers.find(
				(customer) => customer._id.toString() === user._id.toString()
			);
			// Calculate position
			const customerPosition = isCustomer
				? (await QueueModel.findLastPosition(queue._id)) + 1
				: 0;
			// Create ticket for queue
			const ticket = await TicketsModel.create({
				queue: {
					queue_dto: queue._id,
					position: customerPosition,
					date: queue.createdAt,
				},
				type: "queue",
				customer: user._id,
				service: service._id,
				barber: barber._id,
				approved: !!isCustomer,
				status: isCustomer ? "queue" : "pending",
			});

			await queue.updateOne({
				$push: {
					tickets: ticket._id,
				},
			});
			await queue.save();

			// Emit queue data update to queue room
			const updatedQueue = await QueueModel.findById(queue._id);
			await updatedQueue?.populateAll();

			GlobalSocket.io.to(queue._id.toString()).emit(SocketUrls.GetQueue, {
				queue: updatedQueue,
			});

			GlobalSocket.emitGlobalEvent(barber._id.toString(), "USER_JOINED", {
				customer: user,
			});

			await ticket.populateAll();

			// Update barber live info
			await BarbersModel.updateLiveInfo(barber._id.toString(), {
				queue: updatedQueue,
			});

			return res.status(200).json({ ticket });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async workerJoinQueue(req: Request, res: Response) {
		try {
			const worker: IWorkerDocument = res.locals.worker;

			const queue = await QueueModel.findBarberTodayQueue(
				worker.barber._id.toString()
			);

			if (!queue) {
				throw new HttpException(400, SYSTEM_ERRORS.QUEUE_NOT_FOUND);
			}

			// Check if worker isn't in queue
			if (
				!queue.workers.some((w) => w._id.toString() === worker._id.toString())
			) {
				await queue.updateOne({
					$push: { workers: worker._id },
				});
			}

			await queue.populateAll();
			await worker.populate("user");

			// emit events to other queue users
			GlobalSocket.emitGlobalEvent(
				queue._id.toString(),
				"WORKER_JOINED_QUEUE",
				{
					worker,
				}
			);

			const updatedQueue = await QueueModel.findById(queue._id);

			// emit updated queue data to other workers
			GlobalSocket.io
				.to(queue._id.toString())
				.emit(SocketUrls.GetQueue, { queue: updatedQueue });

			return res.json({ queue: updatedQueue });
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new QueueRepository();
