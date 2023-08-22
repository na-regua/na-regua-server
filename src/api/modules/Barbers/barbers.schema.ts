import { hashSync } from "bcryptjs";
import { InferSchemaType, Schema, Document } from "mongoose";

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
		status: {
			type: String,
			enum: ["pre", "completed", ""],
			required: true,
		},
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

BarbersSchema.pre("save", async function (next) {
	const barber: IBarberDocument = this;

	if (barber.isModified("password")) {
		barber.password = hashSync(barber.password, 12);
	}

	next();
});

BarbersSchema.methods.toJSON = function (): TBarber {
	const { password, accessToken, ...barber } = this.toObject();

	return barber;
};

export { BarbersSchema, IBarberDocument, TBarber };
