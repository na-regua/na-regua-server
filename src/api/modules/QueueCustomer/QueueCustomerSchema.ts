import { Document, InferSchemaType, Model, Schema, model } from "mongoose";
import { IQueueMethods } from "../Queue/QueueSchema";
const uniqueValidator = require("mongoose-unique-validator");

const QueueCustumerSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "Users",
		},
		attendedBy: {
			type: Schema.Types.ObjectId,
			ref: "Workers",
		},
		attendedAt: Date,
		missedAt: Date,
		queue: {
			type: Schema.Types.ObjectId,
			ref: "Queues",
		},
		position: {
			type: Number,
		},
		status: {
			type: String,
			enum: ["pending", "queue", "missed", "served"],
			default: "pending",
		},
		approved: { type: Boolean, default: false },
		service: {
			type: Schema.Types.ObjectId,
			ref: "Services",
			required: true,
		},
		schedule: {
			type: {
				time: Date,
				date: Date,
			},
		},
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "QueueCostumers",
	}
);

type TQueueCustumer = InferSchemaType<typeof QueueCustumerSchema>;

interface IQueueCustumerDocument extends TQueueCustumer, Document {}

interface IQueueCustumerMethods {}

interface IQueueCustumerModel
	extends Model<IQueueCustumerDocument, {}, IQueueCustumerMethods> {}

const QueueCustomerModel: IQueueCustumerModel = model<
	IQueueCustumerDocument,
	IQueueCustumerModel
>("QueueCustomers", QueueCustumerSchema);

export {
	QueueCustomerModel,
	IQueueCustumerDocument,
	IQueueCustumerMethods,
	IQueueCustumerModel,
	TQueueCustumer,
};
