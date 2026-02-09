import { HttpException, SYSTEM_ERRORS, errorHandler } from "@core/index";
import { Request, Response } from "express";
import { BarbersModel, IBarberDocument } from "../Barbers";
import { NotificationMessageType } from "../Notifications";
import NotificationsRepository from "../Notifications/NotificationsRepository";
import { ServicesModel } from "../Services";
import {
	GetSchedulesFilters,
	ITicketsDocument,
	TicketsModel,
	TicketType,
} from "../Tickets";
import { IUserDocument } from "../Users";
import { apply_timezone, remove_timezone } from "@utils/date";
import { FilterQuery } from "mongoose";
import { PaginatedResponse } from "@api/models";

export class SchedulesRepository {
	async list_schedules_appointments(req: Request, res: Response) {
		try {
			const barber: IBarberDocument = res.locals.barber;
			const { from, to, customer_id } = req.query;

			const from_date = from
				? apply_timezone(new Date(from as string))
				: undefined;
			const to_date = to ? apply_timezone(new Date(to as string)) : undefined;

			const filter: GetSchedulesFilters = {
				from: from_date,
				to: to_date,
			};

			if (customer_id) {
				filter.customer_id = customer_id as string;
			}

			const schedule_tickets = await TicketsModel.get_schedules(
				barber._id,
				filter
			);

			return res.status(200).json({ schedules: schedule_tickets });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async list_available(req: Request, res: Response) {
		try {
			const { barberId, from, to } = req.query;

			const barber = await BarbersModel.findById(barberId);

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			const { schedule_limit_days } = barber.config;
			const today = remove_timezone(new Date());
			const limit = remove_timezone(new Date(today));
			limit.setDate(limit.getDate() + schedule_limit_days);

			const from_date = from ? apply_timezone(new Date(from as string)) : today;
			const to_date = to ? apply_timezone(new Date(to as string)) : limit;

			const available_schedules = await barber.get_available_schedules(
				from_date,
				to_date
			);

			return res.status(200).json(available_schedules);
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

			const d = apply_timezone(new Date(date));
			const is_valid_schedule_date = await TicketsModel.is_valid_schedule_date(
				barber,
				d,
				time
			);

			if (!is_valid_schedule_date) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_SCHEDULE_DATE);
			}

			const is_customer = barber.customers.some(
				(customer_id) => customer_id.toString() === user._id.toString()
			);

			const schedule = await TicketsModel.create({
				customer: user._id,
				barber: barberId,
				service: serviceId,
				additional_services: [],
				approved: is_customer,
				status: is_customer ? "scheduled" : "pending",
				type: TicketType.Schedule,
				schedule: {
					date: d,
					time,
				},
			});

			if (!schedule) {
				throw new HttpException(400, SYSTEM_ERRORS.SCHEDULE_NOT_CREATED);
			}

			// Notify barber workers
			const messageType: NotificationMessageType = is_customer
				? "CUSTOMER_SCHEDULED_APPOINTMENT"
				: "USER_ASK_TO_SCHEDULE";

			await NotificationsRepository.notify_barber_workers(
				barberId,
				messageType,
				{
					barber: barberId,
					service: serviceId,
					ticket: schedule._id,
					customer: user._id,
				},
				user.avatar._id.toString()
			);

			return res.status(201).json(schedule);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async list_by_user(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;
			const { from, to, time, limit, offset, barberId } = req.query;

			const filters: FilterQuery<ITicketsDocument> = {
				type: TicketType.Schedule,
				customer: user._id,
			};

			const tickets = await TicketsModel.find(filters)
				.limit(+(limit || 0))
				.skip(+(offset || 0));

			const total = await TicketsModel.countDocuments(filters);

			await Promise.all(
				tickets.map(async (ticket) => {
					await ticket.populateAll();
				})
			);

			const paginated_res: PaginatedResponse<ITicketsDocument> = {
				content: tickets,
				total,
				limit: +(limit || 0) || undefined,
				offset: +(limit || 0) || undefined,
			};

			return res.status(200).json(paginated_res);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async update() {}

	async delete() {}
}

export default new SchedulesRepository();
