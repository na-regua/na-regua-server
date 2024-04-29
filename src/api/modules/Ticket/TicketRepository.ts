import { Request, Response } from "express";
import { IUserDocument } from "../Users";
import { errorHandler } from "@core/index";
import { TicketModel } from "./TicketSchema";

class TicketRepository {
	async index(req: Request, res: Response) {
		try {
			const params = req.query;

			const customers = await TicketModel.find()
				.populate("user", "name email")
				.populate("queue", "code")
				.populate("servedBy", "name email")
				.sort({ createdAt: -1 });

			return res.status(200).json(customers);
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

	async delete(req: Request, res: Response) {}
}

export default new TicketRepository();
