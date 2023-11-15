import { HttpException } from "@core/HttpException/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { errorHandler } from "@core/errorHandler/errorHandler";
import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { IBarberDocument } from "../Barbers";
import { IServiceDocument, ServicesModel, TService } from "./Services.schema";

class ServicesRepository {
	async index(req: Request, res: Response): Promise<Response<TService[]>> {
		try {
			const query = req.query;

			const filter: FilterQuery<IServiceDocument> = {};

			if (query.barberId) {
				filter.barber = query.barberId;
			}

			const services = await ServicesModel.find(filter);

			return res.status(200).json(services);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async create(req: Request, res: Response): Promise<Response<TService>> {
		try {
			const body = req.body;

			const barber: IBarberDocument = res.locals.barber;

			body.barber = barber._id;

			const newService = await ServicesModel.create(body);

			if (!newService) {
				throw new HttpException(400, SYSTEM_ERRORS.SERVICE_NOT_CREATED);
			}

			barber.services.push(newService._id);
			await barber.save();

			return res.status(201).json(newService);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async update(req: Request, res: Response): Promise<Response<TService>> {
		try {
			const { id } = req.params;
			const body = req.body;

			const barber: IBarberDocument = res.locals.barber;

			const updatedService = await ServicesModel.findOneAndUpdate(
				{
					_id: id,
					barber: barber._id,
				},
				body
			);

			return res.status(201).json(updatedService);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response): Promise<Response<null>> {
		try {
			const { id } = req.params;
			const barber: IBarberDocument = res.locals.barber;

			const service = await ServicesModel.findByIdAndDelete(id);

			if (!service) {
				throw new HttpException(400, SYSTEM_ERRORS.SERVICE_NOT_FOUND);
			}

			await barber.updateOne({
				$pull: {
					services: service._id,
				},
			});

			return res.status(200).json(service);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new ServicesRepository();
