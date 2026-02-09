import { Model, model } from "mongoose";

import { SocketUrls } from "@core/Socket";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import {
	getDayToWorkDays,
	getTodayAndNextTo,
	is_from_to_on_limit,
} from "@utils/date";
import { Document, InferSchemaType, Schema } from "mongoose";
import { GlobalSocket } from "../../../app";
import { NotificationMessageType } from "../Notifications";
import { TicketsModel, TicketStatus, TicketType } from "../Tickets";
import { UsersModel } from "../Users";
import { AvailableScheduleDate } from "./BarbersModel";

const uniqueValidator = require("mongoose-unique-validator");

const AddressSchema = new Schema(
	{
		cep: {
			type: String,
			required: true,
			match: [/^\d{5}-\d{3}$/, SYSTEM_ERRORS.INVALID_CEP],
		},
		city: {
			type: String,
			required: true,
		},
		uf: {
			type: String,
			required: true,
		},
		neighborhood: {
			type: String,
			required: true,
		},
		street: {
			type: String,
			required: true,
		},
		number: {
			type: Number,
			required: true,
		},
		complement: String,
	},
	{ versionKey: false, timestamps: false, _id: false }
);

const AttendanceSchema = new Schema(
	{
		work_days: {
			type: [String],
			enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
			default: ["mon", "tue", "wed", "thu", "fri"],
		},
		work_time: {
			start: {
				type: String,
				default: "08:00",
			},
			end: {
				type: String,
				default: "17:00",
			},
		},
		open_barber_auto: {
			type: Boolean,
			default: false,
		},
		open_queue_auto: {
			type: Boolean,
			default: false,
		},
		schedule_limit_days: {
			type: Number,
			enum: [7, 15, 30],
			default: 30,
		},
		schedules_by_day: {
			type: Number,
			default: 4,
			required: true,
		},
		schedule_times: {
			type: [String],
		},
	},
	{ versionKey: false, timestamps: false, _id: false }
);

export const defaultAttendanceConfig = {
	work_days: ["mon", "tue", "wed", "thu", "fri"],
	work_time: {
		start: "08:00",
		end: "17:00",
	},
	open_barber_auto: false,
	open_queue_auto: false,
	schedule_limit_days: 30,
	schedules_by_day: 4,
	schedule_times: [],
};

const BarbersSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		address: {
			type: AddressSchema,
			required: true,
		},
		phone: {
			type: Number,
			required: true,
			unique: true,
		},
		verified: {
			type: Boolean,
			default: false,
		},
		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "active",
		},
		profile_status: {
			type: String,
			enum: ["pre", "completed"],
			default: "pre",
		},
		code: { type: String, unique: true },
		avatar: {
			type: Schema.Types.ObjectId,
			ref: "Files",
		},
		thumbs: {
			type: [Schema.Types.ObjectId],
			ref: "Files",
		},
		config: {
			type: AttendanceSchema,
			default: defaultAttendanceConfig,
		},
		open: {
			type: Boolean,
			default: false,
		},
		customers: {
			type: [Schema.Types.ObjectId],
			ref: "Users",
			default: [],
		},
		rating: {
			type: Number,
			default: 0,
		},
	},
	{
		versionKey: false,
		collection: "Barbers",
		timestamps: true,
	}
);

type TBarber = InferSchemaType<typeof BarbersSchema>;

interface IBarberDocument extends Document, TBarber {
	populateAll(): Promise<IBarberDocument>;
	updateRating(): Promise<void>;
	get_available_schedules(
		from: Date,
		to: Date
	): Promise<AvailableScheduleDate[]>;
}

interface IBarberMethods {}

interface IBarbersModel extends Model<IBarberDocument, IBarberMethods> {
	populateAll(): Promise<IBarbersModel>;
	updateLiveInfo(
		barber_id: string,
		data?: Object,
		notify?: NotificationMessageType
	): Promise<IBarberDocument>;
}

BarbersSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });

BarbersSchema.methods.toJSON = function (): TBarber {
	const barber = this.toObject();

	return barber;
};

BarbersSchema.methods.populateAll =
	async function (): Promise<IBarberDocument> {
		await this.populate("avatar");
		await this.populate("thumbs");
		await this.populate("customers");

		return this as IBarberDocument;
	};

BarbersSchema.methods.updateRating = async function (): Promise<void> {
	const barber = this;

	const ratings = await TicketsModel.find({
		barber: barber._id.toString(),
		status: "served",
		rate: { $ne: null },
	});

	if (ratings.length === 0) {
		return;
	}

	const sum = ratings.reduce(
		(total, item) => total + (item.rate?.rating || 0),
		0
	);

	const avg = sum / ratings.length;

	const rounded = Math.round(avg * 2) / 2;

	const rating = Math.max(0, Math.min(5, rounded));

	await barber.updateOne({ rating });

	await barber.save();
};

BarbersSchema.methods.get_available_schedules = async function (
	from: Date,
	to: Date
): Promise<AvailableScheduleDate[]> {
	const barber = this as IBarberDocument;
	const { work_days, schedule_times, schedule_limit_days, schedules_by_day } =
		barber.config;
	const available_schedules: AvailableScheduleDate[] = [];

	while (from <= to) {
		// Check if the date is in barber limit days
		const is_on_limit = is_from_to_on_limit(
			new Date(from),
			new Date(to),
			schedule_limit_days
		);

		// Check if the date is in the barber work days
		const day = getDayToWorkDays[new Date(from).getDay()];
		const is_on_work_days = work_days.includes(day);

		// get appointments for this day
		const { today: from_today, next_day: from_next_day } = getTodayAndNextTo(
			1,
			from
		);
		const appointments = await TicketsModel.find({
			barber: barber._id,
			type: TicketType.Schedule,
			status: {
				$in: [TicketStatus.Pending, TicketStatus.Scheduled],
			},
			"schedule.date": {
				$gte: from_today,
				$lt: from_next_day,
			},
		});

		// fill available schedules
		if (is_on_limit && is_on_work_days) {
			const available_day_schedules: AvailableScheduleDate = {
				date: new Date(from),
				schedules: schedule_times,
			};
			const is_today = new Date(from).getDate() === new Date().getDate();

			// remove passed times
			if (is_today) {
				const now = new Date();
				const nowTime = now.getHours() + now.getMinutes() / 60;

				available_day_schedules.schedules = schedule_times.filter((time) => {
					const [hour, minute] = time.split(":");
					const timeValue = parseInt(hour) + parseInt(minute) / 60;
					return timeValue > nowTime;
				});
			}

			if (appointments.length > 0) {
				const scheduled_times = appointments.map(
					(appointment) => appointment?.schedule?.time ?? ""
				);

				available_day_schedules.schedules =
					available_day_schedules.schedules.filter(
						(time) => !scheduled_times.includes(time)
					);
			}

			if (available_day_schedules.schedules.length > 0) {
				available_schedules.push(available_day_schedules);
			}
		}

		// go to next day
		from.setDate(from.getDate() + 1);
	}

	return available_schedules;
};

BarbersSchema.statics.updateLiveInfo = async function (
	barber_id: string,
	data?: Object,
	notify?: NotificationMessageType
): Promise<void> {
	const updatedBarber = await this.findById(barber_id);

	if (updatedBarber) {
		await updatedBarber.populateAll();

		const socketUrl = SocketUrls.BarberInfo.replace("{{barberId}}", barber_id);
		GlobalSocket.io.emit(socketUrl, {
			barber: updatedBarber,
			is_open: updatedBarber.open,
			...data,
		});

		if (updatedBarber.open && notify) {
			const customersOrFavorites = await UsersModel.find({
				$or: [
					{ favorites: updatedBarber._id },
					{ _id: { $in: updatedBarber.customers } },
				],
			});

			if (customersOrFavorites) {
				const notifyUrl = SocketUrls.BarberInfoNotification.replace(
					"{{barberId}}",
					barber_id
				);

				customersOrFavorites.forEach(async (customer) => {
					GlobalSocket.io
						.to(customer._id.toString())
						.emit(SocketUrls.NewNotification, {
							notification: {
								message: notify,
								data: {
									barber: updatedBarber,
								},
							},
						});
				});
			}
		}
	}
};

BarbersSchema.pre("save", async function (next) {
	const barber = this;

	next();
});

const BarbersModel: IBarbersModel = model<IBarberDocument, IBarbersModel>(
	"Barbers",
	BarbersSchema
);

export { BarbersModel, BarbersSchema, IBarberDocument, IBarbersModel, TBarber };
