import { InferSchemaType, Schema } from "mongoose";

const uniqueValidator = require("mongoose-unique-validator");

const BarbersSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minLength: 6,
		},
		cep: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
		},
		code: String,
		regionCode: {
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
		number: Number,
		complement: String,
		accessToken: String,
	},
	{
		versionKey: false,
		collection: "Users",
		timestamps: true,
	}
);

type TBarber = InferSchemaType<typeof BarbersSchema>;

interface IBarberDocument extends TBarber, Document {}

BarbersSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });

BarbersSchema.methods.toJSON = function (): TBarber {
	const { password, accessToken, ...barber } = this.toObject();

	return barber;
};

export { BarbersSchema, IBarberDocument, TBarber };
