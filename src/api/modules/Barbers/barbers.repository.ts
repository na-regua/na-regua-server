import { HttpException } from "@core/ErrorException";
import { errorHandler } from "@core/errorHandler";
import { Request, Response } from "express";
import { BarbersModel } from "./barbers.model";
import { TBarber } from "./barbers.schema";
import { TService } from "../Services";

class BarbersRepository {
	async index(req: Request, res: Response): Promise<Response<TBarber[]>> {
		try {
			const barbers = await BarbersModel.find();

			return res.status(200).json(barbers);
		} catch (err: any) {
			return errorHandler(err, res);
		}
	}

	async preSignIn(req: Request, res: Response): Promise<Response<TBarber>> {
		try {
			const body = req.body;

			if (!req.files) {
				throw new HttpException(400, "Não foi enviado nenhum arquivo!");
			}

			const newBarber: TBarber = {
				...body,
			};

			const avatar = (req.files as any)[0];
			const thumbs = req.files;

			newBarber.avatar = avatar.buffer;
			newBarber.thumbs = (thumbs as any[]).map((thumb) => thumb.buffer);

			const barber = await BarbersModel.create(newBarber);

			return res.status(201).json(barber);
		} catch (err: any) {
			return errorHandler(err, res);
		}
	}
}

export default new BarbersRepository();
