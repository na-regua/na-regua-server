import { Model, model } from "mongoose";

import { SocketUrls } from "@core/Socket";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { GlobalSocket } from "../../../app";
import { Document, InferSchemaType, Schema } from "mongoose";
import { NotificationMessageType } from "../Notifications";
import { TicketsModel } from "../Tickets";
import { UsersModel } from "../Users";

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

const getDayToWorkDays: Record<number, string> = {
	0: "sun",
	1: "mon",
	2: "tue",
	3: "wed",
	4: "thu",
	5: "fri",
	6: "sat",
};

const AttendanceSchema = new Schema(
	{
		workdays: {
			type: [String],
			enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
			default: ["mon", "tue", "wed", "thu", "fri"],
		},
		worktime: {
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

export {
	BarbersModel,
	BarbersSchema,
	IBarberDocument,
	IBarbersModel,
	TBarber,
	getDayToWorkDays,
};
