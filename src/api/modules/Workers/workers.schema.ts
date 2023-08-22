import mongoose, { InferSchemaType } from "mongoose";

const WorkersSchema = new mongoose.Schema(
	{
		barberId: {
			type: mongoose.Schema.Types.ObjectId,
		},
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		password: {
			type: String,
		},
		avatar: {
			type: Buffer,
			required: true,
			content: String,
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
