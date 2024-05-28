import { HttpException } from "@core/HttpException/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { errorHandler } from "@core/errorHandler/errorHandler";
import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { IBarberDocument } from "../Barbers";
import { IServiceDocument, ServicesModel, TService } from "./ServicesSchema";

class ServicesRepository {
	async index(req: Request, res: Response): Promise<Response<TService[]>> {
		try {
			const query = req.query;

			const filter: FilterQuery<IServiceDocument> = {};

			if (query.barberId) {
				filter.barber = query.barberId;
			}

			if (query.additional) {
				filter.additional = query.additional;
			}

			if (query.all) {
				delete filter.additional;
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

			return res.status(201).json(newService);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async update(req: Request, res: Response): Promise<Response<TService>> {
		try {
			const { serviceId } = req.params;
			const body = req.body;

			const barber: IBarberDocument = res.locals.barber;

			if (!serviceId) {
				throw new HttpException(400, SYSTEM_ERRORS.SERVICE_NOT_FOUND);
			}

			const service = await ServicesModel.findByIdAndUpdate(
				{
					_id: serviceId,
					barber: barber._id,
				},
				body
			);

			if (!service) {
				throw new HttpException(400, SYSTEM_ERRORS.SERVICE_NOT_FOUND);
			}

			const updatedService = await ServicesModel.findById(serviceId);

			return res.status(201).json(updatedService);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response): Promise<Response<null>> {
		try {
			const { serviceId } = req.params;
			const barber: IBarberDocument = res.locals.barber;

			const allServices = await ServicesModel.find({ barber: barber._id });

			if (!serviceId) {
				throw new HttpException(400, SYSTEM_ERRORS.SERVICE_NOT_FOUND);
			}

			if (!allServices) {
				throw new HttpException(400, SYSTEM_ERRORS.NO_SERVICES_TO_DELETE);
			}

			if (allServices.length === 1) {
				throw new HttpException(
					400,
					SYSTEM_ERRORS.BARBER_SHOULD_HAVE_ONE_SERVICE
				);
			}

			const service = await ServicesModel.findById(serviceId);

			if (!service) {
				throw new HttpException(400, SYSTEM_ERRORS.SERVICE_NOT_FOUND);
			}

			await service.deleteOne();

			return res.status(200).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new ServicesRepository();
