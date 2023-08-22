import { InferSchemaType, Schema } from "mongoose";

const ServicesSchema = new Schema(
	{
		barberId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		name: {
			type: String,
			required: true,
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

interface IServiceDocument extends TService, Document {
	isOwner: (id: string) => boolean;
}

ServicesSchema.methods.isOwner = function (id: string): boolean {
	return this.barberId.toString() === id;
}

export { ServicesSchema, TService, IServiceDocument };
