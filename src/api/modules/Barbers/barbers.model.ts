import { Model, model } from "mongoose";
import { BarbersSchema, IBarberDocument } from "./Barbers.schema";

interface IBarberMethods {}

interface IBarbersModel extends Model<IBarberDocument, IBarberMethods> {}

const BarbersModel: IBarbersModel = model<IBarberDocument, IBarbersModel>(
	"Barbers",
	BarbersSchema
);

export { BarbersModel, IBarbersModel };
