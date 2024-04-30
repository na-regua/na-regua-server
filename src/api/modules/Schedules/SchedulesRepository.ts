import { HttpException, SYSTEM_ERRORS, errorHandler } from "@core/index";
import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { BarbersModel, IBarberDocument } from "../Barbers";
import { ServicesModel } from "../Services";
import { IUserDocument } from "../Users";
import { ISchedulesDocument, SchedulesModel } from "./SchedulesSchema";

export class SchedulesRepository {
	async listByToken(req: Request, res: Response) {
		try {
			//TODO - Add pagination
			const barber: IBarberDocument = res.locals.barber;

			const from = req.query.from as string;

			const filter: FilterQuery<ISchedulesDocument> = {
				barber: barber._id,
			};

			if (from) {
				// For now it's filtering by date to 00:00 to 00:00 of the next day
				filter.date = {
					$gte: new Date(from),
					$lt: new Date(from).setDate(new Date(from).getDate() + 1),
				};
			}

			const scheduleTickets = await SchedulesModel.find(filter);

			return res.status(200).json({ schedules: scheduleTickets });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async listScheduledDates(req: Request, res: Response) {
		try {
			const barber: IBarberDocument = res.locals.barber;

			const from = req.query.from as string;

			const barberLimit = barber.attendanceConfig.scheduleLimitDays || 7;
			const fromDate = (from && new Date(from)) || new Date();
			const limitDate = new Date(fromDate);
			limitDate.setDate(limitDate.getDate() + barberLimit);

			const filter: FilterQuery<ISchedulesDocument> = {
				barber: barber._id,
				date: {
					$gte: fromDate,
					$lt: limitDate,
				},
			};

			const scheduledDates = await SchedulesModel.distinct("date", filter);

			return res.status(200).json({ scheduledDates });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async create(req: Request, res: Response) {
		try {
			// TODO - verify if date and time is valid for the barber attendance config
			const user: IUserDocument = res.locals.user;

			const { barberId, serviceId, date, time } = req.body;

			const barber = await BarbersModel.findById(barberId);

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			const service = await ServicesModel.findOne({
				barber: barberId,
				_id: serviceId,
			});

			if (!service) {
				throw new HttpException(400, SYSTEM_ERRORS.SERVICE_NOT_FOUND);
			}

			const schedule = await SchedulesModel.create({
				user: user._id,
				barber: barberId,
				service: serviceId,
				date,
				time,
			});

			if (!schedule) {
				throw new HttpException(400, SYSTEM_ERRORS.SCHEDULE_NOT_CREATED);
			}

			return res.status(201).json(schedule);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async update() {}

	async delete() {}
}

export default new SchedulesRepository();
