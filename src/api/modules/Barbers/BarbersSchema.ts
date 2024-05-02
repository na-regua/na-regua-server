import { Model, model } from "mongoose";

import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { Document, InferSchemaType, Schema } from "mongoose";

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
		workDays: {
			type: [String],
			enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
			default: ["mon", "tue", "wed", "thu", "fri"],
		},
		workTime: {
			start: {
				type: String,
				default: "08:00",
			},
			end: {
				type: String,
				default: "17:00",
			},
		},
		openBarberAuto: {
			type: Boolean,
			default: false,
		},
		openQueueAuto: {
			type: Boolean,
			default: false,
		},
		scheduleLimitDays: {
			type: Number,
			enum: [7, 15, 30],
			default: 30,
		},
		schedulesByDay: {
			type: Number,
			default: 4,
			required: true,
		},
		scheduleTimes: {
			type: [
				{
					time: {
						type: String,
						required: true,
					},
				},
			],
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
		profileStatus: {
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
}

interface IBarberMethods {}

interface IBarbersModel extends Model<IBarberDocument, IBarberMethods> {}

BarbersSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });

BarbersSchema.methods.toJSON = function (): TBarber {
	const barber = this.toObject();

	return barber;
};

BarbersSchema.methods.populateAll =
	async function (): Promise<IBarberDocument> {
		await this.populate("avatar");
		await this.populate("thumbs");

		return this as IBarberDocument;
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
