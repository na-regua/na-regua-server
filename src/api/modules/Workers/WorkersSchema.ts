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

interface IWorkerMethods {
	populateAll(): Promise<IWorkerDocument>;
}
interface IWorkerDocument extends TWorker, Document, IWorkerMethods {}

WorkersSchema.methods.populateAll = async function (this: IWorkerDocument) {
	await this.populate("barber user");
	return this;
};

interface IWorkersModel extends Model<IWorkerDocument, {}, IWorkerMethods> {}

const WorkersModel: IWorkersModel = model<IWorkerDocument, IWorkersModel>(
	"Workers",
	WorkersSchema
);

export { IWorkerDocument, IWorkersModel, WorkersModel, TWorker, WorkersSchema };
