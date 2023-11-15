import mongoose, { Document, InferSchemaType, Model, model } from "mongoose";

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
			unique: true,
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

interface IWorkerMethods {}

interface IWorkersModel extends Model<IWorkerDocument, {}, IWorkerMethods> {}

const WorkersModel: IWorkersModel = model<IWorkerDocument, IWorkersModel>(
	"Workers",
	WorkersSchema
);

export { IWorkerDocument, IWorkersModel, TWorker, WorkersModel, WorkersSchema };
