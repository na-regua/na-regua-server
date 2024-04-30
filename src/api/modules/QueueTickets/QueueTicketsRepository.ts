import { errorHandler } from "@core/index";
import { Request, Response } from "express";
import { IUserDocument } from "../Users";
import { QueueTicketsModel } from "./QueueTicketsSchema";

export class QueueTicketsRepository {
	async index(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const queueTickets = await QueueTicketsModel.find({});
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async show() {}

	async create() {}

	async update() {}

	async delete() {}
}
