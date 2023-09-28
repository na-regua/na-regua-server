import { HttpException } from "@core/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { compareSync, hashSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import mongoose, { InferSchemaType, Document } from "mongoose";

import isEmail from "validator/lib/isEmail";
const uniqueValidator = require("mongoose-unique-validator");

const TOKEN_SECRET = process.env.TOKEN_SECRET || "naRegua";

const UsersSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
			unique: true,
			match: [
				/^\([1-9]{2}\) (?:[2-8]|9[0-9])[0-9]{3}\-[0-9]{4}$/,
				"Telefone inválido",
			],
		},
		email: {
			type: String,
			unique: true,
			trim: true,
			lowercase: true,
			validate: [isEmail, SYSTEM_ERRORS.INVALID_EMAIL],
		},
		password: {
			type: String,
			required: true,
			minLength: 6,
		},
		avatar: {
			type: Buffer,
			required: true,
			content: String,
		},
		accessToken: String,
		role: {
			type: String,
			required: true,
			enum: ["admin", "worker", "custommer"],
		},
		phoneConfirmed: {
			type: Boolean,
			default: false,
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
	generateAuthToken?: () => Promise<string>;
}

UsersSchema.methods.generateAuthToken = async function () {
	const user = this as IUserDocument;
	const token = sign({ _id: user._id }, TOKEN_SECRET, {
		expiresIn: "24h",
	});

	user.accessToken = token;

	await user.save();

	return token;
};

UsersSchema.methods.toJSON = function (): TUser {
	const { password, accessToken, ...user } = this.toObject();

	return user;
};

UsersSchema.statics.findByCredentials = async function (
	email: string,
	password: string
): Promise<IUserDocument> {
	let UserModel = this;

	const user = await UserModel.findOne({ email });

	if (!user) {
		return Promise.reject(new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND));
	}

	if (!compareSync(password, user.password)) {
		return Promise.reject(
			new HttpException(400, SYSTEM_ERRORS.INVALID_PASSWORD)
		);
	}

	return user;
};

UsersSchema.pre("save", async function (next) {
	const user: IUserDocument = this;

	if (user.isModified("password")) {
		user.password = hashSync(user.password, 12);
	}

	next();
});

export { IUserDocument, TUser, UsersSchema };
