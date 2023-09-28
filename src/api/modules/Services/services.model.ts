import { Model, model } from "mongoose";
import { IServiceDocument, ServicesSchema } from "./Services.schema";

interface IServiceMethods {}

interface IServicesModel extends Model<IServiceDocument, {}, IServiceMethods> {}

const ServicesModel: IServicesModel = model<IServiceDocument, IServicesModel>(
	"Services",
	ServicesSchema
);

export { IServicesModel, ServicesModel };
