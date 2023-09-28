import { hashSync } from "bcryptjs";
import mongoose, { InferSchemaType, Document } from "mongoose";

const uniqueValidator = require("mongoose-unique-validator");

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

interface IUserDocument extends TUser, Document {}

UsersSchema.pre("save", async function (next) {
	const user: IUserDocument = this;

	if (user.isModified("password")) {
		user.password = hashSync(user.password, 12);
	}

	next();
});

UsersSchema.methods.toJSON = function (): TUser {
	const { password, accessToken, ...user } = this.toObject();

	return user;
};

export { IUserDocument, TUser, UsersSchema };
