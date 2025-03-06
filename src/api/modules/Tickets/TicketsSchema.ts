import {
	Document,
	FilterQuery,
	InferSchemaType,
	Model,
	Schema,
	model,
} from "mongoose";
import { IBarberDocument } from "../Barbers";
import { IQueueDocument } from "../Queue";
import { IServiceDocument } from "../Services";
import { IUserDocument } from "../Users";
import { IWorkerDocument } from "../Workers";
import { getDayToWorkDays, is_date_on_limit } from "@utils/date";

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

const RatingSchema = new Schema(
	{
		rating: {
			type: Number,
			required: true,
			min: 0,
			max: 5,
		},
		comment: {
			type: String,
			maxLength: 124,
			minLength: 5,
		},
	},
	{ versionKey: false, _id: false, timestamps: true }
);

enum TicketStatus {
	Pending = "pending",
	Queue = "queue",
	Scheduled = "scheduled",
	Missed = "missed",
	Served = "served",
}

enum TicketType {
	Queue = "queue",
	Schedule = "schedule",
}

const TicketsSchema = new Schema(
	{
		customer: {
			type: Schema.Types.ObjectId,
			ref: "Users",
			required: true,
		},
		status: {
			type: String,
			enum: Object.values(TicketStatus),
			default: TicketStatus.Pending,
		},
		barber: {
			type: Schema.Types.ObjectId,
			ref: "Barbers",
			required: true,
		},
		type: {
			type: String,
			enum: Object.values(TicketType),
			required: true,
		},
		service: {
			type: Schema.Types.ObjectId,
			ref: "Services",
			required: true,
		},
		additional_services: {
			type: [Schema.Types.ObjectId],
			ref: "Services",
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
		rate: {
			type: RatingSchema,
		},
		is_paid: {
			type: Boolean,
			default: false,
		},
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Tickets",
	}
);

type TTicket = InferSchemaType<typeof TicketsSchema>;

interface ITicketsMethods {
	populateAll(): Promise<ITicketsDocument>;
}

interface ITicketsDocument extends TTicket, Document, ITicketsMethods {}

interface ITicketsPopulated
	extends Omit<
		ITicketsDocument,
		"customer" | "barber" | "queue" | "service" | "served_by" | "rating"
	> {
	customer: IUserDocument;
	barber: IBarberDocument;
	service: IServiceDocument;
	queue: {
		queue_dto: IQueueDocument;
		position: number;
		date: Date;
	};
	served_by: IWorkerDocument;
}

TicketsSchema.statics.get_schedules = async function (
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

	const offset = filters?.offset ?? 0;

	const schedules = await this.find(filter).skip(offset);

	return schedules;
};

TicketsSchema.statics.is_valid_schedule_date = async function (
	barber: IBarberDocument,
	date: Date,
	time: string
) {
	// Check if the date is in barber limit days
	const { work_days, schedule_limit_days } = barber.config;

	const limit = schedule_limit_days || 30;

	const is_on_limit = is_date_on_limit(date, limit);

	if (!is_on_limit) {
		console.log("out of limit");
		return false;
	}

	// Check if the date is in the barber work days
	const day = getDayToWorkDays[date.getDay()];

	if (!day) {
		return false;
	}

	if (day) {
		const is_on_work_days = work_days.includes(day);

		if (!is_on_work_days) {
			console.log("is not a work day");
			return false;
		}
	}
	// Check if time is on the barber schedule times
	const schedule_times = barber.config.schedule_times;

	if (!schedule_times.includes(time)) {
		return false;
	}

	const is_today = new Date(date).getDate() === new Date().getDate();

	// remove passed times
	if (is_today) {
		const now = new Date();
		const nowTime = now.getHours() + now.getMinutes() / 60;
		const [hours, minutes] = time.split(":").map(Number);
		const scheduleTime = hours + minutes / 60;

		if (scheduleTime < nowTime) {
			return false;
		}
	}

	// Check if the barber has a schedule in this date/time
	const from_date = new Date(date);
	const to_date = new Date(date);
	to_date.setDate(to_date.getDate() + 1);

	const has_appointments = await this.find({
		barber: barber._id,
		type: TicketType.Schedule,
		"schedule.date": {
			$gte: from_date,
			$lt: to_date,
		},
		"schedule.time": time,
	});

	if (has_appointments.length > 0) {
		return false;
	}

	return true;
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
	await this.populate("additional_services");
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
	is_valid_schedule_date(
		barber: IBarberDocument,
		date: Date,
		time: string
	): Promise<boolean>;
	get_schedules(
		barber_id: string,
		filters?: GetSchedulesFilters
	): Promise<ITicketsDocument[]>;
}

const TicketsModel: ITicketsModel = model<ITicketsDocument, ITicketsModel>(
	"Tickets",
	TicketsSchema
);

export {
	GetSchedulesFilters,
	ITicketsDocument,
	ITicketsPopulated,
	TTicket,
	TicketStatus,
	TicketType,
	TicketsModel,
};
