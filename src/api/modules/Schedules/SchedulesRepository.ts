import { errorHandler } from "@core/index";
import { Request, Response } from "express";
import { IUserDocument } from "../Users";
import { SchedulesModel } from "./SchedulesSchema";

export class SchedulesRepository {
	async index(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const scheduleTickets = await SchedulesModel.find({});

			return res.status(200).json(scheduleTickets);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async show() {}

	async create() {}

	async update() {}

	async delete() {}
}
