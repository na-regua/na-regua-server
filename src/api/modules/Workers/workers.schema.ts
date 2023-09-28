import mongoose, { InferSchemaType } from "mongoose";

const WorkersSchema = new mongoose.Schema(
	{
		barber: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Barbers",
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users",
			required: true,
		},
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Workers",
	}
);

type TWorker = InferSchemaType<typeof WorkersSchema>;

interface IWorkerDocument extends TWorker, Document {}

export { IWorkerDocument, TWorker, WorkersSchema };
