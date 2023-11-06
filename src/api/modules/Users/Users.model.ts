import { Model, model } from "mongoose";
import { IUserDocument, UsersSchema } from "./Users.schema";
import { NextFunction, Request } from "express";

type TRoles = "admin" | "worker" | "custommer";

interface IUsersModel extends Model<IUserDocument> {
	findByCredentials: (
		email: string,
		password: string
	) => Promise<IUserDocument>;
	findByPhone: (phone: string) => Promise<IUserDocument>;
	findByToken: (token: string) => Promise<IUserDocument>;
}

const UsersModel: IUsersModel = model<IUserDocument, IUsersModel>(
	"Users",
	UsersSchema
);

export { IUsersModel, UsersModel, TRoles };
