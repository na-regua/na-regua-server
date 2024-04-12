import { Request, Response } from "express";
import { IUserDocument } from "../Users";
import { errorHandler } from "@core/index";
import { QueueCustomerModel } from "./QueueCustomerSchema";

class QueueCustomerRepository {
	async index(req: Request, res: Response) {
		try {
			const params = req.query;

			const queueCostumers = await QueueCustomerModel.find()
				.populate("user", "name email")
				.populate("queue", "code")
				.populate("attendedBy", "name email")
				.sort({ createdAt: -1 });

			return res.status(200).json(queueCostumers);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async create(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const { queueId } = req.body;

			const queueCostumer = await QueueCustomerModel.create({
				user: user._id,
				queue: queueId,
			});
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response) {}
}

export default new QueueCustomerRepository();
