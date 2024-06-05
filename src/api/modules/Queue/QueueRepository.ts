import {
	HttpException,
	SYSTEM_ERRORS,
	SocketUrls,
	errorHandler,
} from "@core/index";
import { getTodayAndNextTo } from "@utils/index";
import { Request, Response } from "express";
import { GlobalSocket } from "../../../app";
import { BarbersModel, IBarberDocument } from "../Barbers";
import { NotificationMessageType } from "../Notifications";
import NotificationsRepository from "../Notifications/NotificationsRepository";
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

			const { today, next_day } = getTodayAndNextTo(1);

			const has_created_queue_today = await QueueModel.findOne({
				barber: barber._id.toString(),
				createdAt: {
					$gte: today,
					$lt: next_day,
				},
			});

			if (has_created_queue_today) {
				throw new HttpException(
					400,
					SYSTEM_ERRORS.QUEUE_CAN_CREATE_ONLY_ONE_PER_DAY
				);
			}

			if (!barber.open) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_IS_CLOSED);
			}

			const new_queue = await QueueModel.create({
				barber: barber._id,
				workers: [worker._id],
			});

			// Update barber live info
			await BarbersModel.updateLiveInfo(
				barber._id.toString(),
				{
					queue: new_queue,
				},
				"BARBER_QUEUE_IS_ON"
			);

			return res.status(201).json({ queue: new_queue });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async get_today_queue(req: Request, res: Response) {
		try {
			const barber: IBarberDocument = res.locals.barber;

			const queue = await QueueModel.findBarberTodayQueue(barber._id);

			return res.status(200).json({ queue });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async get_today_queue_by_barber_id(req: Request, res: Response) {
		try {
			const { barberId } = req.params;

			const barber = await BarbersModel.findById(barberId);

			if (!barber) {
				return new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			const queue = await QueueModel.findBarberTodayQueue(barber._id);

			return res.status(200).json({ queue });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async user_join_queue(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const {
				code,
				serviceId: service_id,
				additionalServicesId: additional_services_id,
			} = req.body;

			const service = await ServicesModel.findById(service_id);

			if (!service) {
				throw new HttpException(400, SYSTEM_ERRORS.SERVICE_NOT_FOUND);
			}

			const additional_services = await ServicesModel.find({
				_id: { $in: additional_services_id },
			});

			const barber = await BarbersModel.findOne({ code });

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			if (!barber.open) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_IS_CLOSED);
			}

			// Check if user has a ticket in queue
			const { today, next_day } = getTodayAndNextTo(1);

			const queue = await QueueModel.findBarberTodayQueue(
				barber._id.toString()
			);

			if (!queue) {
				throw new HttpException(400, SYSTEM_ERRORS.QUEUE_NOT_FOUND);
			}

			// Check if user is already in queue
			await queue.populate("tickets");

			const user_already_on_queue = (queue.tickets as any[]).find(
				(ticket: any) =>
					(ticket as ITicketsDocument).customer._id.toString() ===
					user._id.toString()
			);

			if (
				user_already_on_queue &&
				((user_already_on_queue as ITicketsDocument).status === "queue" ||
					(user_already_on_queue as ITicketsDocument).status === "scheduled")
			) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_ALREADY_IN_QUEUE);
			}
			// Check if user is in other queue
			const isOnQueue = await TicketsModel.findOne({
				customer: user._id,
				type: "queue",
				status: {
					$in: ["pending", "queue"],
				},
				"queue.date": {
					$gte: today,
					$lt: next_day,
				},
			});

			if (isOnQueue) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_ALREADY_IN_OTHER_QUEUE);
			}
			// Check if user is already a customer in barber
			const is_customer = barber.customers.find(
				(customer) => customer._id.toString() === user._id.toString()
			);
			// Calculate position
			const customer_position = is_customer
				? (await QueueModel.findLastPosition(queue._id)) + 1
				: 0;
			// Create ticket for queue
			const ticket = await TicketsModel.create({
				queue: {
					queue_dto: queue._id,
					position: customer_position,
					date: queue.createdAt,
				},
				type: "queue",
				customer: user._id,
				service: service._id,
				barber: barber._id,
				approved: !!is_customer,
				status: is_customer ? "queue" : "pending",
				additional_services: additional_services.map((s) => s._id),
			});

			await queue.updateOne({
				$push: {
					tickets: ticket._id,
				},
			});
			await queue.save();

			// Emit queue data update to queue room
			const updated_queue = await QueueModel.findById(queue._id);
			if (updated_queue) {
				await updated_queue.populateAll();

				GlobalSocket.io.to(queue._id.toString()).emit(SocketUrls.GetQueue, {
					queue: updated_queue,
				});

				// Update barber live info
				await BarbersModel.updateLiveInfo(barber._id.toString(), {
					queue: updated_queue,
				});
			}

			// Emit user joined event to barber
			GlobalSocket.emitGlobalEvent(barber._id.toString(), "USER_JOINED", {
				customer: user,
			});

			await ticket.populateAll();

			return res.status(200).json({ ticket });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async user_leave_queue(req: Request, res: Response) {
		try {
			const { ticketId: ticket_id } = req.params;

			let ticket = await TicketsModel.findById(ticket_id);

			if (!ticket) {
				throw new HttpException(400, SYSTEM_ERRORS.QUEUE_NOT_FOUND);
			}

			// Check if ticket is queue
			const is_queue_ticket = ticket.type === "queue";

			if (is_queue_ticket && ticket && ticket.queue) {
				let queue = await QueueModel.findById(
					ticket.queue.queue_dto.toString()
				);

				if (!queue) {
					throw new HttpException(400, SYSTEM_ERRORS.QUEUE_NOT_FOUND);
				}

				// Update ticket status
				const ticket_new_status = "missed";

				ticket = await TicketsModel.findByIdAndUpdate(
					ticket._id.toString(),
					{ status: ticket_new_status, missedAt: new Date() },
					{ new: true }
				);

				// Remove ticket from queue
				queue = await QueueModel.findByIdAndUpdate(
					queue._id.toString(),
					{
						$pull: { tickets: ticket?._id.toString() },
						$push: { misseds: ticket?._id.toString() },
					},
					{ new: true }
				);

				if (!queue) {
					throw new HttpException(400, SYSTEM_ERRORS.QUEUE_NOT_FOUND);
				}

				await ticket?.populateAll();
				await queue.populateAll();

				// Emit queue update to queue room
				GlobalSocket.io
					.to(queue._id.toString())
					.emit(SocketUrls.GetQueue, { queue });

				// Emit user left event to barbers
				queue.workers.forEach((w: any) => {
					GlobalSocket.emitGlobalEvent(w.user._id.toString(), "USER_LEAVE", {
						customer: ticket?.customer,
					});
				});
			}

			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async worker_join_queue(req: Request, res: Response) {
		try {
			const worker: IWorkerDocument = res.locals.worker;
			const barber: IBarberDocument = res.locals.barber;

			const queue = await QueueModel.findBarberTodayQueue(
				barber._id.toString()
			);

			if (!queue) {
				throw new HttpException(400, SYSTEM_ERRORS.QUEUE_NOT_FOUND);
			}

			// Check if worker isn't in queue
			if (
				!queue.workers.some((w) => w._id.toString() === worker._id.toString())
			) {
				await queue.updateOne(queue._id.toString(), {
					$push: { workers: worker._id },
				});

				GlobalSocket.emitGlobalEvent(
					queue?._id.toString(),
					"WORKER_JOINED_QUEUE",
					{
						worker,
					}
				);
			}

			const updated_queue = await QueueModel.findById(queue._id.toString());

			if (!updated_queue) {
				return;
			}

			await updated_queue.populateAll();
			await worker.populate("user");

			// emit events to other queue users
			GlobalSocket.io
				.to(updated_queue._id.toString())
				.emit(SocketUrls.GetQueue, { queue: updated_queue });

			return res.json({ queue: updated_queue });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async worker_approve_ticket(req: Request, res: Response) {
		try {
			const worker: IWorkerDocument = res.locals.worker;
			const barber: IBarberDocument = res.locals.barber;

			let queue = await QueueModel.findBarberTodayQueue(
				worker.barber._id.toString()
			);

			if (!queue) {
				throw new HttpException(400, SYSTEM_ERRORS.QUEUE_NOT_FOUND);
			}

			if (
				!queue.workers.some((qw) => qw._id.toString() === worker._id.toString())
			) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_IN_QUEUE);
			}

			const { ticketId: ticket_id } = req.params;

			const ticket = await TicketsModel.findById(ticket_id).populate(
				"customer"
			);

			if (!ticket) {
				throw new HttpException(400, SYSTEM_ERRORS.TICKET_NOT_FOUND);
			}

			// Check if ticket is in queue
			if (
				!queue.tickets.some((t) => t._id.toString() === ticket._id.toString())
			) {
				throw new HttpException(400, SYSTEM_ERRORS.TICKET_NOT_FOUND);
			}

			// Update ticket status
			const newStatus = ticket.type === "queue" ? "queue" : "scheduled";

			const newPosition =
				(await QueueModel.findLastPosition(queue._id.toString())) + 1;

			const updated_ticket = await TicketsModel.findByIdAndUpdate(
				ticket._id.toString(),
				{
					approved: true,
					status: newStatus,
					"queue.position": newPosition,
				},
				{ new: true }
			);

			if (!updated_ticket) {
				throw new HttpException(400, SYSTEM_ERRORS.TICKET_NOT_FOUND);
			}

			await worker.populate("barber");
			await worker.populate("user");
			await updated_ticket.populateAll();

			// Emit ticket data to customer
			GlobalSocket.io
				.to(updated_ticket._id.toString())
				.emit(SocketUrls.GetTicket, { ticket: updated_ticket });

			// Emit approve event to customer
			GlobalSocket.emitGlobalEvent(
				updated_ticket._id.toString(),
				"WORKER_APPROVED_TICKET",
				{
					customer: updated_ticket.customer,
					worker,
				}
			);
			// Emit approve event to other queue workers
			await queue.populate("workers");

			const other_queue_workers = (queue.workers as any[]).filter(
				(w) => w._id.toString() !== worker._id.toString()
			);

			if (other_queue_workers.length > 0) {
				other_queue_workers.forEach((w) => {
					GlobalSocket.emitGlobalEvent(w._id.toString(), "USER_APPROVED", {
						customer: updated_ticket.customer,
						worker,
					});
				});
			}

			// Emit queue data to queue workers
			await queue.populateAll();

			GlobalSocket.io
				.to(queue._id.toString())
				.emit(SocketUrls.GetQueue, { queue });

			// Add user as customer
			await barber.updateOne({
				$push: {
					customers: ticket.customer._id.toString(),
				},
			});

			// Update barber live info
			await BarbersModel.updateLiveInfo(barber._id.toString(), {
				queue,
			});

			// Notify user that he was added as customer
			const messageType: NotificationMessageType =
				"WORKER_ADD_USER_AS_CUSTOMER";

			await NotificationsRepository.notify_user(
				updated_ticket.customer._id.toString(),
				messageType,
				{ worker },
				(worker.user as any).avatar._id.toString()
			);

			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async worker_reject_ticket(req: Request, res: Response) {
		try {
			const worker: IWorkerDocument = res.locals.worker;
			const barber: IBarberDocument = res.locals.barber;

			let queue = await QueueModel.findBarberTodayQueue(
				worker.barber._id.toString()
			);

			if (!queue) {
				throw new HttpException(400, SYSTEM_ERRORS.QUEUE_NOT_FOUND);
			}

			if (
				!queue.workers.some((qw) => qw._id.toString() === worker._id.toString())
			) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_IN_QUEUE);
			}

			const { ticketId } = req.params;

			let ticket = await TicketsModel.findById(ticketId);

			if (!ticket) {
				throw new HttpException(400, SYSTEM_ERRORS.TICKET_NOT_FOUND);
			}

			// Check if ticket is in queue
			if (
				!queue.tickets.some((t) => t._id.toString() === ticket?._id.toString())
			) {
				throw new HttpException(400, SYSTEM_ERRORS.TICKET_NOT_FOUND);
			}

			// Update ticket status
			const newStatus = "missed";

			ticket = await TicketsModel.findByIdAndUpdate(
				ticket._id.toString(),
				{ approved: false, status: newStatus, missedAt: new Date() },
				{ new: true }
			);

			if (!ticket) {
				throw new HttpException(400, SYSTEM_ERRORS.TICKET_NOT_FOUND);
			}

			queue = await QueueModel.findByIdAndUpdate(
				queue._id.toString(),
				{ $pull: { tickets: ticket._id.toString() } },
				{ new: true }
			);

			if (!queue) {
				throw new HttpException(400, SYSTEM_ERRORS.QUEUE_NOT_FOUND);
			}

			await worker.populate("barber");
			await worker.populate("user");
			await ticket.populateAll();

			// Emit ticket data to customer
			GlobalSocket.io
				.to(ticket._id.toString())
				.emit(SocketUrls.GetTicket, { ticket });

			// Emit reject event to customer
			GlobalSocket.emitGlobalEvent(
				ticket._id.toString(),
				"WORKER_REJECTED_TICKET",
				{
					customer: ticket.customer,
					worker,
				}
			);

			// Emit approve event to other queue workers
			await queue.populate("workers");

			const other_queue_workers = (queue.workers as any[]).filter(
				(w) => w._id.toString() !== worker._id.toString()
			);

			if (other_queue_workers.length > 0) {
				other_queue_workers.forEach((w: IWorkerDocument) => {
					GlobalSocket.emitGlobalEvent(w._id.toString(), "USER_REJECTED", {
						customer: ticket?.customer,
						worker: w,
					});
				});
			}

			// Emit queue data to queue workers
			await queue.populateAll();

			GlobalSocket.io
				.to(queue._id.toString())
				.emit(SocketUrls.GetQueue, { queue });

			// Update barber live info
			await BarbersModel.updateLiveInfo(barber._id.toString(), {
				queue,
			});

			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async worker_go_next_ticket(req: Request, res: Response) {
		try {
			const worker: IWorkerDocument = res.locals.worker;
			const barber: IBarberDocument = res.locals.barber;

			const queue = await QueueModel.findBarberTodayQueue(
				barber._id.toString()
			);

			if (!queue) {
				throw new HttpException(400, SYSTEM_ERRORS.QUEUE_NOT_FOUND);
			}

			if (
				!queue.workers.some((qw) => qw._id.toString() === worker._id.toString())
			) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_IN_QUEUE);
			}

			const ticket = await TicketsModel.findOne({
				barber: barber._id.toString(),
				status: "queue",
				$or: [
					{
						"queue.position": queue.current_position,
					},
					{
						"queue.position": {
							$gt: queue.current_position,
						},
					},
				],
				"queue.queue_dto": queue._id.toString(),
			}).sort("queue.position");

			await ticket?.populateAll();

			if (!ticket) {
				throw new HttpException(400, SYSTEM_ERRORS.TICKET_NOT_FOUND);
			}

			// Check if ticket is in queue
			if (
				!queue.tickets.some((t) => t._id.toString() === ticket._id.toString())
			) {
				throw new HttpException(400, SYSTEM_ERRORS.TICKET_NOT_IN_QUEUE);
			}

			// Update ticket status
			const new_status = "served";

			const updated_ticket = await TicketsModel.findByIdAndUpdate(
				ticket._id.toString(),
				{ status: new_status, servedAt: new Date(), servedBy: worker._id },
				{ new: true }
			);

			if (!updated_ticket) {
				throw new HttpException(400, SYSTEM_ERRORS.TICKET_NOT_FOUND);
			}

			await worker.populate("user");
			await updated_ticket.populateAll();
			const updated_queue = await QueueModel.findByIdAndUpdate(
				queue._id.toString(),
				{
					$pull: { tickets: updated_ticket._id.toString() },
					$push: { serveds: updated_ticket._id.toString() },
					current_position: queue.current_position + 1,
				},
				{ new: true }
			);

			if (!updated_queue) {
				return;
			}

			await updated_queue.populateAll();

			// Emit ticket data to customer
			GlobalSocket.io
				.to(updated_ticket._id.toString())
				.emit(SocketUrls.GetTicket, { ticket: updated_ticket });

			// Emit serve event to customer

			await worker.populate("user barber");
			GlobalSocket.emitGlobalEvent(
				updated_ticket._id.toString(),
				"WORKER_SERVED_TICKET",
				{
					worker,
				}
			);

			// Emit serve event to other queue workers

			await updated_queue.populate("workers");

			const other_queue_workers = (updated_queue.workers as any[]).filter(
				(w) => w._id.toString() !== worker._id.toString()
			);

			if (other_queue_workers.length > 0) {
				other_queue_workers.forEach((w: IWorkerDocument) => {
					GlobalSocket.emitGlobalEvent(w._id.toString(), "TICKET_SERVED", {
						customer: updated_ticket.customer,
						worker,
					});
				});
			}

			// Emit queue data to queue workers
			GlobalSocket.io
				.to(updated_queue._id.toString())
				.emit(SocketUrls.GetQueue, { queue: updated_queue });

			// Update barber live info

			await BarbersModel.updateLiveInfo(barber._id.toString(), {
				queue: updated_queue,
			});

			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new QueueRepository();
