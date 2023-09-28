import { Request, Response } from "express";
import { TService } from "./Services.schema";
import { errorHandler } from "@core/errorHandler";
import { ServicesModel } from "./Services.model";
import { HttpException } from "@core/ErrorException";

class ServicesRepository {
	async index(req: Request, res: Response): Promise<Response<TService[]>> {
		try {
			const services = await ServicesModel.find();

			return res.status(200).json(services);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async create(req: Request, res: Response): Promise<Response<TService>> {
		try {
			const body = req.body;

			if (!body) {
				throw new HttpException(400, "Body is empty!");
			}

			const newService = await ServicesModel.create(body);

			return res.status(201).json(newService);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async update(req: Request, res: Response): Promise<Response<TService>> {
		try {
			const id = req.path;
			const body = req.body;

			const service = await ServicesModel.findById(id);

			if (!service) {
				throw new HttpException(400, "Body is empty!");
			}

			if (!service.isOwner(id)) {
				throw new HttpException(401, "Unauthorized!");
			}

			await service.updateOne(body);

			return res.status(201).json(service);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response): Promise<Response<null>> {
		try {
			const id = req.path;

			const service = await ServicesModel.findById(id);

			if (!service) {
				throw new HttpException(400, "No service found!");
			}

			if (!service.isOwner(id)) {
				throw new HttpException(401, "Unauthorized!");
			}

			await service.deleteOne();

			return res.status(201).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new ServicesRepository();
