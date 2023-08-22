import { Model, model } from "mongoose";
import { BarbersSchema, IBarberDocument } from "./barbers.schema";

interface IBarberMethods {
	findByCredentials(phone: string): Promise<IBarberDocument>;
	findByToken(token: string): Promise<IBarberDocument>;
}

interface IBarberModel extends Model<IBarberDocument, {}, IBarberMethods> {}

const BarbersModel: IBarberModel = model<IBarberDocument, IBarberModel>(
	"Barbers",
	BarbersSchema
);

export { BarbersModel, IBarberModel };
