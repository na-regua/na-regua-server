import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { Document, InferSchemaType, Schema, SchemaDefinition } from "mongoose";

const uniqueValidator = require("mongoose-unique-validator");

const serviceConfigDefinition: SchemaDefinition = {
	schedulesByDay: {
		type: Number,
		default: 4,
		required: true,
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
	schedules: [
		{
			time: {
				type: String,
				required: true,
			},
		},
		{
			recommended: {
				type: Boolean,
			},
		},
		{
			active: {
				type: Boolean,
			},
		},
	],
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
		phone: {
			type: String,
			required: true,
			unique: true,
		},
		phoneConfirmed: {
			type: Boolean,
			default: false,
		},
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
		code: { type: String, unique: true },
		avatar: {
			type: Schema.Types.ObjectId,
			ref: "Files",
			required: true,
		},
		profileStatus: {
			type: String,
			enum: ["pre", "completed"],
			default: "pre",
		},
		thumbs: {
			type: [Schema.Types.ObjectId],
			ref: "Files",
		},
		workers: {
			type: [Schema.Types.ObjectId],
			ref: "Workers",
		},
		services: {
			type: [Schema.Types.ObjectId],
			ref: "Services",
		},
		approvedCustommers: {
			type: [Schema.Types.ObjectId],
			ref: "Users",
		},
		workDays: {
			type: [String],
			enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
			default: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
		},
		businessDaysConfig: serviceConfigDefinition,
		holidaysConfig: serviceConfigDefinition,
		scheduleLimitDays: {
			type: Number,
			default: 30,
			enum: [7, 15, 30],
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

	const condition = barber.workers.length > 0 && barber.services.length > 0;

	if (condition) {
		if (barber.profileStatus === "pre") {
			barber.profileStatus = "completed";
		}
	} else {
		if (barber.profileStatus === "completed") {
			barber.profileStatus = "pre";
		}
	}

	next();
});

export { BarbersSchema, IBarberDocument, TBarber };
