import {
	Document,
	FilterQuery,
	InferSchemaType,
	Model,
	Schema,
	model,
} from "mongoose";
import { IBarberDocument, getDayToWorkDays } from "../Barbers";

const QueueDataSchema = new Schema(
	{
		queue_dto: {
			type: Schema.Types.ObjectId,
			ref: "Queues",
			required: true,
		},
		position: {
			type: Number,
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
	},
	{
		_id: false,
		versionKey: false,
		timestamps: false,
	}
);

const ScheduleSchema = new Schema(
	{
		date: {
			type: Date,
			required: true,
		},
		time: {
			type: String,
			required: true,
		},
	},
	{
		_id: false,
		versionKey: false,
		timestamps: false,
	}
);

const TicketsSchema = new Schema(
	{
		customer: {
			type: Schema.Types.ObjectId,
			ref: "Users",
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "queue", "scheduled", "missed", "served"],
			default: "pending",
		},
		barber: {
			type: Schema.Types.ObjectId,
			ref: "Barbers",
			required: true,
		},
		type: {
			type: String,
			enum: ["queue", "schedule"],
			required: true,
		},
		service: {
			type: Schema.Types.ObjectId,
			ref: "Services",
			required: true,
		},
		queue: {
			type: QueueDataSchema,
		},
		schedule: {
			type: ScheduleSchema,
		},
		billed: { type: Boolean, default: false },
		approved: { type: Boolean, default: false },
		served_by: {
			type: Schema.Types.ObjectId,
			ref: "Workers",
		},
		servedAt: Date,
		missedAt: Date,
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Tickets",
	}
);

type TTicket = InferSchemaType<typeof TicketsSchema>;

interface ITicketsDocument extends TTicket, Document {}

interface ITicketsMethods {
	populateAll(): Promise<ITicketsDocument>;
}

TicketsSchema.statics.getSchedules = async function (
	barber_id: string,
	filters?: GetSchedulesFilters
) {
	const filter: FilterQuery<ITicketsDocument> = {
		barber: barber_id,
		type: "schedule",
	};

	if (filters) {
		const { from, to, customer_id } = filters;

		if (from) {
			const fromDate = new Date(from);

			const nextDay = new Date(fromDate);
			nextDay.setDate(nextDay.getDate() + 1);

			// For now it's filtering by date to 00:00 to 00:00 of the next day
			filter["schedule.date"] = {
				$gte: fromDate,
			};

			if (to) {
				const toDate = new Date(to);
				filter["schedule.date"]["$lt"] = toDate;
			}

			if (!to) {
				filter["schedule.date"]["$lt"] = nextDay;
			}
		}

		if (customer_id) {
			filter.customer = customer_id;
		}
	}

	const offset = filters?.offset || 0;

	const schedules = await this.find(filter).skip(offset);

	return schedules;
};

TicketsSchema.statics.isValidScheduleDate = async function (
	barber: IBarberDocument,
	date: Date,
	time: string
) {
	// Check if the date is in barber limit days
	const today = new Date();

	const limit = barber.config?.schedule_limit_days || 30;

	const limitDate = new Date(today);
	limitDate.setDate(limitDate.getDate() + limit);

	if (date < today || date > limitDate) {
		return false;
	}

	// Check if the date is in the barber work days
	const day = getDayToWorkDays[today.getDay()];

	if (!day) {
		return false;
	}

	if (day) {
		const isOnWorkDays = barber.config?.workdays.includes(day);

		if (!isOnWorkDays) {
			return false;
		}
	}
	// Check if time is on the barber schedule times

	// Check if the barber has a schedule in this date/time
	const fromDate = new Date(date);
	const toDate = new Date(date);
	toDate.setDate(toDate.getDate() + 1);

	const hasOnThisTime = await this.find({
		barber: barber._id,
		type: "schedule",
		"schedule.date": {
			$gte: fromDate,
			$lt: toDate,
		},
		"schedule.time": time,
	});

	if (hasOnThisTime.length > 0) {
		return false;
	}

	return false;
};

TicketsSchema.methods.populateAll = async function () {
	await this.populate("customer");
	await this.populate({
		path: "barber",
		populate: {
			path: "avatar",
		},
	});
	await this.populate("service");
	await this.populate("queue.queue_dto");
	await this.populate("served_by");

	return this;
};

interface GetSchedulesFilters {
	from?: Date | string;
	to?: Date | string;
	customer_id?: string;
	offset?: number;
}

interface ITicketsModel extends Model<ITicketsDocument, {}, ITicketsMethods> {
	isValidScheduleDate(
		barber: IBarberDocument,
		date: Date,
		time: string
	): Promise<boolean>;
	getSchedules(
		barber_id: string,
		filters?: GetSchedulesFilters
	): Promise<ITicketsDocument[]>;
}

const TicketsModel: ITicketsModel = model<ITicketsDocument, ITicketsModel>(
	"Tickets",
	TicketsSchema
);

export { GetSchedulesFilters, ITicketsDocument, TTicket, TicketsModel };
