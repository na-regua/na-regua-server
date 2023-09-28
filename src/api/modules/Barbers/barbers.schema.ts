import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { Document, InferSchemaType, Schema } from "mongoose";

const uniqueValidator = require("mongoose-unique-validator");

const BarbersSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "Users",
			required: true,
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
			type: Buffer,
			required: true,
			content: String,
		},
		thumbs: [Buffer],
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
			ref: "Custommers",
		},
		profileStatus: {
			type: String,
			enum: ["pre", "complete"],
			default: "pre",
		},
	},
	{
		versionKey: false,
		collection: "Barbers",
		timestamps: true,
	}
);

type TBarber = InferSchemaType<typeof BarbersSchema>;

interface IBarberDocument extends TBarber, Document {}

BarbersSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });

BarbersSchema.methods.toJSON = function (): TBarber {
	const barber = this.toObject();

	return barber;
};

export { BarbersSchema, IBarberDocument, TBarber };
