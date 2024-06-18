import {
	HttpException,
	SYSTEM_ERRORS,
	SocketUrls,
	errorHandler,
} from "@core/index";
import { getTodayAndNextTo } from "@utils/date";
import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { GlobalSocket } from "../../../app";
import { BarbersModel } from "../Barbers";
import { IUserDocument } from "../Users";
import { ITicketsDocument, TicketsModel } from "./TicketsSchema";

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

	async user_today_tickets(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const { today, next_day } = getTodayAndNextTo(1);

			const queue_ticket = await TicketsModel.findOne({
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

			const schedule_ticket = await TicketsModel.find({
				customer: user._id,
				type: "schedule",
				status: {
					$in: ["pending", "queue"],
				},
				"schedule.date": {
					$gte: today,
					$lt: next_day,
				},
			});

			await queue_ticket?.populateAll();

			return res.status(200).json({
				queue: queue_ticket,
				schedules: schedule_ticket,
			});
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response) {}

	async rate(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const { ticketId } = req.params;
			const { rating, comment, on_queue } = req.body;

			const ticket = await TicketsModel.findById(ticketId);

			if (!ticket) {
				throw new HttpException(404, SYSTEM_ERRORS.TICKET_NOT_FOUND);
			}

			if (ticket.customer.toString() !== user._id.toString()) {
				throw new HttpException(403, SYSTEM_ERRORS.FORBIDDEN);
			}

			const barber = await BarbersModel.findById(ticket.barber._id.toString());

			if (!barber) {
				throw new HttpException(404, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			const updated_ticket = await TicketsModel.findByIdAndUpdate(
				ticket._id,
				{
					rate: {
						rating,
						comment,
					},
				},
				{ new: true }
			);

			if (on_queue && updated_ticket) {
				await updated_ticket.populateAll();

				GlobalSocket.io
					.to(updated_ticket._id.toString())
					.emit(SocketUrls.GetTicket, { ticket: updated_ticket });
			}

			await barber.updateRating();

			return res.status(200).json();
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async list_by_user(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const { search } = req.query;
			let offset = Number(req.query.offset) || 0;
			const limit = Number(req.query.limit) || 0;

			const filter_query: FilterQuery<ITicketsDocument> = {
				customer: user._id.toString(),
				status: "served",
			};

			const tickets = await TicketsModel.find(filter_query)
				.sort({ createdAt: -1 })
				.limit(offset);

			const total = await TicketsModel.find(filter_query).countDocuments();

			const has_more = total - offset > 0;
			const next = offset + limit < total || has_more;

			await Promise.all(
				tickets.map(async (ticket) => {
					await ticket.populateAll();
				})
			);

			return res.status(200).json({ tickets, total, offset, limit, next });
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new TicketsRepository();
