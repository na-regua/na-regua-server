import { errorHandler } from "@core/index";
import { Request, Response } from "express";
import { TicketsModel } from "../Tickets";
import { IUserDocument } from "../Users";

export class QueueTicketsRepository {
	async index(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const queueTickets = await TicketsModel.find({});
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async show() {}

	async create() {}

	async update() {}

	async delete() {}
}
