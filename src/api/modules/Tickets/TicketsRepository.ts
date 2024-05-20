import { errorHandler } from "@core/index";
import { getTodayAndNextTo } from "@utils/date";
import { Request, Response } from "express";
import { IUserDocument } from "../Users";
import { TicketsModel } from "./TicketsSchema";

class TicketsRepository {
	async index(req: Request, res: Response) {
		try {
			const params = req.query;

			const tickets = await TicketsModel.find().sort({ createdAt: -1 });

			await Promise.all(
				tickets.map(async (ticket) => {
					await ticket.populateAll();
				})
			);

			return res.status(200).json();
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async create(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const { queueId } = req.body;
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async byUserToday(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const { today, nextDay } = getTodayAndNextTo(1);

			const queueTicket = await TicketsModel.findOne({
				customer: user._id,
				type: "queue",
				status: {
					$in: ["pending", "queue"],
				},
				"queue.date": {
					$gte: today,
					$lt: nextDay,
				},
			});

			const todayScheduleTicket = await TicketsModel.find({
				customer: user._id,
				type: "schedule",
				status: {
					$in: ["pending", "queue"],
				},
				"schedule.date": {
					$gte: today,
					$lt: nextDay,
				},
			});

			await queueTicket?.populateAll();

			return res.status(200).json({
				queue: queueTicket,
				todaySchedule: todayScheduleTicket,
			});
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response) {}
}

export default new TicketsRepository();
