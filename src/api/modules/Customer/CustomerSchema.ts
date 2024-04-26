import { Document, InferSchemaType, Model, Schema, model } from "mongoose";
import { IQueueMethods } from "../Queue/QueueSchema";
const uniqueValidator = require("mongoose-unique-validator");

const CustumerSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "Users",
		},
		status: {
			type: String,
			enum: ["pending", "queue", "scheduled", "missed", "served"],
			default: "pending",
		},
		approved: { type: Boolean, default: false },
		position: {
			type: Number,
		},
		barber: {
			type: Schema.Types.ObjectId,
			ref: "Barbers",
		},
		service: {
			type: Schema.Types.ObjectId,
			ref: "Services",
			required: true,
		},
		queue: {
			type: Schema.Types.ObjectId,
			ref: "Queues",
		},
		schedule: {
			type: Schema.Types.ObjectId,
			ref: "Schedules",
		},
		servedBy: {
			type: Schema.Types.ObjectId,
			ref: "Workers",
		},
		servedAt: Date,
		missedAt: Date,
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Customers",
	}
);

type TCustumer = InferSchemaType<typeof CustumerSchema>;

interface ICustumerDocument extends TCustumer, Document {}

interface ICustumerMethods {}

interface ICustumerModel
	extends Model<ICustumerDocument, {}, ICustumerMethods> {}

const CustomerModel: ICustumerModel = model<ICustumerDocument, ICustumerModel>(
	"Customers",
	CustumerSchema
);

export {
	CustomerModel,
	ICustumerDocument,
	ICustumerMethods,
	ICustumerModel,
	TCustumer,
};
