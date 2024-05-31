import { HttpException, SYSTEM_ERRORS, errorHandler } from "@core/index";
import { Request, Response } from "express";
import { BarbersModel, IBarberDocument } from "../Barbers";
import { NotificationMessageType } from "../Notifications";
import NotificationsRepository from "../Notifications/NotificationsRepository";
import { ServicesModel } from "../Services";
import { GetSchedulesFilters, TicketsModel } from "../Tickets";
import { IUserDocument } from "../Users";

export class SchedulesRepository {
	async listByToken(req: Request, res: Response) {
		try {
			//TODO - Add pagination
			const barber: IBarberDocument = res.locals.barber;

			const from = req.query.from as string;
			const to = req.query.to as string;

			const filter: GetSchedulesFilters = {
				from,
				to,
			};
			const scheduleTickets = await TicketsModel.getSchedules(
				barber._id,
				filter
			);

			return res.status(200).json({ schedules: scheduleTickets });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async listScheduledDates(req: Request, res: Response) {
		try {
			const barber: IBarberDocument = res.locals.barber;

			const barberLimit = barber.config?.schedule_limit_days || 30;
			const fromDate = new Date();
			const limitDate = new Date(fromDate);
			limitDate.setDate(limitDate.getDate() + barberLimit);

			const filters: GetSchedulesFilters = {
				from: fromDate,
				to: limitDate,
			};

			const schedules = await TicketsModel.getSchedules(barber._id, filters);

			const scheduledDates = schedules.map(
				(schedule) => schedule.schedule?.date
			);

			return res.status(200).json({ scheduledDates });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async create(req: Request, res: Response) {
		try {
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
			// verify if its a valid date and time
			const isDateValid = await TicketsModel.isValidScheduleDate(
				barber,
				date,
				time
			);

			if (!isDateValid) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_SCHEDULE_DATE);
			}

			const isCustomer = barber.customers.find(
				(customerId) => customerId.toString() === user._id.toString()
			);

			const schedule = await TicketsModel.create({
				customer: user._id,
				barber: barberId,
				service: serviceId,
				approved: isCustomer,
				status: isCustomer ? "scheduled" : "pending",
				type: "schedule",
				schedule: {
					date,
					time,
				},
			});

			if (!schedule) {
				throw new HttpException(400, SYSTEM_ERRORS.SCHEDULE_NOT_CREATED);
			}

			// Notify barber workers
			const messageType: NotificationMessageType = isCustomer
				? "CUSTOMER_SCHEDULED_APPOINTMENT"
				: "USER_ASK_TO_SCHEDULE";

			await NotificationsRepository.notify_barber_workers(
				barberId,
				messageType,
				{
					barber: barberId,
					service: serviceId,
					schedule: schedule._id,
				},
				user.avatar._id.toString()
			);

			return res.status(201).json(schedule);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async update() {}

	async delete() {}
}

export default new SchedulesRepository();
