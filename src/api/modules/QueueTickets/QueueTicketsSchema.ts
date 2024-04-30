import { InferSchemaType, Schema, Document, Model, model } from "mongoose";

const QueueTicketsSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "Users",
		},
		queue: {
			type: Schema.Types.ObjectId,
			ref: "Queues",
		},
		position: {
			type: Number,
		},
		barber: {
			type: Schema.Types.ObjectId,
			ref: "Barbers",
			required: true,
		},
		service: {
			type: Schema.Types.ObjectId,
			ref: "Services",
			required: true,
		},
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "QueueTickets",
	}
);

type TQueueTickets = InferSchemaType<typeof QueueTicketsSchema>;

interface IQueueTicketsDocument extends TQueueTickets, Document {}

interface IQueueTicketsMethods {}

interface IQueueTicketsModel
	extends Model<IQueueTicketsDocument, {}, IQueueTicketsMethods> {}

const QueueTicketsModel: IQueueTicketsModel = model<
	IQueueTicketsDocument,
	IQueueTicketsModel
>("QueueTickets", QueueTicketsSchema);

export {
	QueueTicketsSchema,
	TQueueTickets,
	QueueTicketsModel,
	IQueueTicketsDocument,
};
