import { InferSchemaType, Model, Schema, Document, model } from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");

const QueueSchema = new Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
		},
		status: {
			type: String,
			enum: ["on", "off", "paused"],
			default: "on",
		},
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Queue",
	}
);

type TQueue = InferSchemaType<typeof QueueSchema>;

interface IQueueDocument extends TQueue, Document {}

QueueSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });

interface IQueueMethods {}

interface IQueueModel extends Model<IQueueDocument, {}, IQueueMethods> {}

const QueueModel: IQueueModel = model<IQueueDocument, IQueueModel>(
	"Queue",
	QueueSchema
);

export { QueueModel, IQueueDocument, IQueueMethods, IQueueModel, TQueue };
