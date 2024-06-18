import { HttpException } from "@core/HttpException/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { compareSync, hashSync } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import mongoose, { Document, InferSchemaType } from "mongoose";

import { Model, model } from "mongoose";

import isEmail from "validator/lib/isEmail";
import TwilioClient from "../Twilio/Twilio.client";

const uniqueValidator = require("mongoose-unique-validator");

const TOKEN_SECRET = process.env.TOKEN_SECRET || "naRegua";

const UsersSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: Number,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			unique: true,
			trim: true,
			lowercase: true,
			required: false,
			validate: [isEmail, SYSTEM_ERRORS.INVALID_EMAIL],
		},
		password: {
			type: String,
			minLength: 6,
		},
		avatar: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Files",
		},
		role: {
			type: String,
			required: true,
			enum: ["admin", "worker", "customer"],
			default: "customer",
		},
		access_token: String,
		verified: {
			type: Boolean,
			default: false,
		},
		worker: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Workers",
		},
		favorites: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Barbers",
		},
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Users",
	}
);

UsersSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });

type TUser = InferSchemaType<typeof UsersSchema>;

interface IUserDocument extends TUser, Document {
	generateAuthToken: () => Promise<string>;
	verifyPhone: () => Promise<boolean>;
}

UsersSchema.methods.generateAuthToken = async function () {
	const user = this as IUserDocument;
	const token = sign({ _id: user._id }, TOKEN_SECRET, {
		expiresIn: "24h",
	});

	user.access_token = token;

	await user.save();

	return token;
};

UsersSchema.methods.toJSON = function (): TUser {
	const { password, access_token, ...user } = this.toObject();

	return user;
};

UsersSchema.statics.findByCredentials = async function (
	email: string,
	password: string
): Promise<IUserDocument> {
	let UserModel = this;

	const user = await UserModel.findOne({ email });

	if (!user) {
		throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
	}

	if (!compareSync(password, user.password)) {
		throw new HttpException(400, SYSTEM_ERRORS.INVALID_PASSWORD);
	}

	return user;
};

UsersSchema.statics.findByPhone = async function (
	phone: string
): Promise<IUserDocument> {
	let UserModel = this;

	const user = UserModel.findOne({ phone });

	if (!user) {
		throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
	}

	return user;
};

UsersSchema.statics.findByToken = async function (
	token: string
): Promise<IUserDocument | HttpException> {
	const UsersModel = this;
	let decoded: any;

	try {
		decoded = verify(token, TOKEN_SECRET);
	} catch {
		return new HttpException(401, SYSTEM_ERRORS.UNAUTHORIZED);
	}

	const user = await UsersModel.findOne({
		_id: decoded._id,
	});

	if (!user) {
		return new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
	}

	if (user.access_token !== token) {
		return new HttpException(401, SYSTEM_ERRORS.UNAUTHORIZED);
	}

	return user;
};

UsersSchema.methods.verifyPhone = async function (code: string): Promise<void> {
	const user = this as IUserDocument;

	const verification = await TwilioClient.verifyOTP(code, user.phone);

	if (!verification || !verification.valid) {
		throw new HttpException(400, SYSTEM_ERRORS.INVALID_CODE);
	}

	await user.updateOne({ verified: true });
};

UsersSchema.pre("save", async function (next) {
	const user: IUserDocument = this as IUserDocument;

	if (user.password && user.isModified("password")) {
		user.password = hashSync(user.password, 12);
	}

	next();
});

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

export {
	IUserDocument,
	IUsersModel,
	TOKEN_SECRET,
	TRoles,
	TUser,
	UsersModel,
	UsersSchema,
};
