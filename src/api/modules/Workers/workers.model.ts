import { Model, model } from "mongoose";
import { IWorkerDocument, WorkersSchema } from "./workers.schema";

interface IWorkerMethods {}

interface IWorkersModel extends Model<IWorkerDocument, {}, IWorkerMethods> {}

const WorkersModel: IWorkersModel = model<IWorkerDocument, IWorkersModel>(
	"Workers",
	WorkersSchema
);

export { IWorkersModel, WorkersModel };
