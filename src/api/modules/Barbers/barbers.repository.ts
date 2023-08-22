import { Request, Response } from "express";
import { TBarber } from "./barbers.schema";
import { BarbersModel } from "./barbers.model";
import { errorHandler } from "@core/errorHandler";

class BarbersRepository {
	async index(req: Request, res: Response): Promise<Response<TBarber[]>> {
		try {
			const barbers = await BarbersModel.find();

			return res.status(200).json(barbers);
		} catch (err: any) {
			return errorHandler(err, res);
		}
	}
}

export default new BarbersRepository();
