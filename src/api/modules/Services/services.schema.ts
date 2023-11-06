import { InferSchemaType, Schema, Document } from "mongoose";

const uniqueValidator = require("mongoose-unique-validator");

const ServicesSchema = new Schema(
	{
		barber: {
			type: Schema.Types.ObjectId,
			ref: "Barbers",
			required: true,
		},
		name: {
			type: String,
			required: true,
			unique: true,
			minLength: 3,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		durationInMinutes: {
			type: Number,
			required: true,
			min: 0,
		},
		icon: {
			type: String,
			enum: ["navalha", "maquina", "pente"],
			required: true,
		},
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Services",
	}
);

type TService = InferSchemaType<typeof ServicesSchema>;

interface IServiceDocument extends TService, Document {}

ServicesSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });

ServicesSchema.methods.toJSON = function (): TService {
	const { barber, ...service } = this.toObject();

	return { ...service, barberId: barber._id };
};

export { ServicesSchema, TService, IServiceDocument };
