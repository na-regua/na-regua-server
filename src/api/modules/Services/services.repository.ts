import { NextFunction, Request, Response } from "express";
import { IServiceDocument, TService } from "./Services.schema";
import { errorHandler } from "@core/errorHandler";
import { ServicesModel } from "./Services.model";
import { HttpException } from "@core/HttpException";
import { IUserDocument } from "../Users";
import { BarbersModel } from "../Barbers";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { FilterQuery } from "mongoose";

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

			const user: IUserDocument = res.locals.user;

			const barber = await BarbersModel.findOne({ user: user._id });

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			body.barber = barber._id;

			const newService = await ServicesModel.create(body);

			return res.status(201).json(newService);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
	
	async update(req: Request, res: Response): Promise<Response<TService>> {
		try {
			const body = req.body;

			const service: IServiceDocument = res.locals.service;

			await service.updateOne(body);

			return res.status(201).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response): Promise<Response<null>> {
		try {
			const { id } = req.params;

			const service = await ServicesModel.findById(id);

			if (!service) {
				throw new HttpException(400, SYSTEM_ERRORS.SERVICE_NOT_FOUND);
			}

			await service.deleteOne();

			return res.status(201).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async isOwner(req: Request, res: Response, next: NextFunction): Promise<any> {
		try {
			const { id } = req.params;

			const user: IUserDocument = res.locals.user;

			const barber = await BarbersModel.findOne({ user: user._id });

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			const service = await ServicesModel.findOne({
				_id: id,
				barber: barber._id,
			});

			if (!service) {
				throw new HttpException(400, SYSTEM_ERRORS.SERVICE_NOT_FOUND);
			}

			if (service.barber._id.toString() !== barber._id.toString()) {
				throw new HttpException(401, SYSTEM_ERRORS.FORBIDDEN);
			}

			res.locals.barber = barber;
			res.locals.service = service;

			next();
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new ServicesRepository();
