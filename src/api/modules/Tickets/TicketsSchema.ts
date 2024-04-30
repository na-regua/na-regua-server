import { Document, InferSchemaType, Model, Schema, model } from "mongoose";

const TicketsSchema = new Schema(
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
		barber: {
			type: Schema.Types.ObjectId,
			ref: "Barbers",
		},
		service: {
			type: Schema.Types.ObjectId,
			ref: "Services",
			required: true,
		},
		queueTicket: {
			type: Schema.Types.ObjectId,
			ref: "QueueTickets",
		},
		schedule: {
			type: Schema.Types.ObjectId,
			ref: "Schedules",
		},
		approved: { type: Boolean, default: false },
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
		collection: "Tickets",
	}
);

type TTicket = InferSchemaType<typeof TicketsSchema>;

interface ITicketsDocument extends TTicket, Document {}

interface ITicketsMethods {}

interface ITicketsModel extends Model<ITicketsDocument, {}, ITicketsMethods> {}

const TicketsModel: ITicketsModel = model<ITicketsDocument, ITicketsModel>(
	"Tickets",
	TicketsSchema
);

export { TicketsModel, ITicketsDocument, TTicket };
