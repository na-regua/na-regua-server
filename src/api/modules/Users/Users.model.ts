import { Model, model } from "mongoose";
import { IUserDocument, UsersSchema } from "./Users.schema";

interface IUserMethods {}

type TRoles = "admin" | "worker" | "custommer";

interface IUsersModel extends Model<IUserDocument, {}, IUserMethods> {}

const UsersModel: IUsersModel = model<IUserDocument, IUsersModel>(
	"Users",
	UsersSchema
);

export { IUsersModel, UsersModel, TRoles };
