import { HttpException, SYSTEM_ERRORS, errorHandler } from "@core/index";
import { Request, Response } from "express";
import { IBarberDocument } from "../Barbers";
import { IUserDocument } from "../Users";
import { QueueModel } from "./QueueSchema";
import { getTodayAndNextTo } from "@utils/index";

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
}

export default new QueueRepository();
