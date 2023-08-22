import { Model, model } from "mongoose";
import { BarbersSchema, IBarberDocument } from "./barbers.schema";

interface IBarberMethods {
	findByCredentials(phone: string): Promise<IBarberDocument>;
	findByToken(token: string): Promise<IBarberDocument>;
}

interface IBarbersModel extends Model<IBarberDocument, {}, IBarberMethods> {}

const BarbersModel: IBarbersModel = model<IBarberDocument, IBarbersModel>(
	"Barbers",
	BarbersSchema
);

export { BarbersModel, IBarbersModel };
