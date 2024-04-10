import { errorHandler } from "@core/index";
import { Request, Response } from "express";
import { QueueModel } from "./QueueSchema";

class QueueRepository {
	async create(req: Request, res: Response) {
		try {
			const body = req.body;

			const newQueue = await QueueModel.create(body);

			return res.status(201).json(newQueue);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new QueueRepository();