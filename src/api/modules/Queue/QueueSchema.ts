import { Document, InferSchemaType, Model, Schema, model } from "mongoose";
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
		workers: {
			type: [Schema.Types.ObjectId],
			ref: "Workers",
		},
		tickets: {
			type: [Schema.Types.ObjectId],
			ref: "Tickets",
		},
		schedules: {
			type: [String],
		},
		showServed: Boolean,
		servedTickets: {
			type: [Schema.Types.ObjectId],
			ref: "Tickets",
		},
		missedTicket: {
			type: [Schema.Types.ObjectId],
			ref: "Tickets",
		},
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Queues",
		methods: {},
	}
);

type TQueue = InferSchemaType<typeof QueueSchema>;

interface IQueueDocument extends TQueue, Document {
	populateAll(): Promise<void>;
	hasTicketOnQueue(ticketId: string): boolean;
	hasWorkerOnQueue(workerId: string): boolean;
}

QueueSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });

QueueSchema.methods.populateAll = async function () {
	const queue = this as IQueueDocument;

	await queue.populate({
		path: "workers",
		populate: { path: "user" },
	});
	await queue.populate({
		path: "tickets",
		populate: { path: "user service" },
		options: {
			sort: {
				approved: 1,
				position: 0,
			},
		},
	});

	await queue.populate("servedTickets missedTickets");
};

QueueSchema.methods.hasTicketOnQueue = function (
	ticketId: string
): boolean {
	const queue = this as IQueueDocument;

	return queue.tickets.some((el) => el._id.toString() === ticketId);
};

QueueSchema.methods.hasWorkerOnQueue = function (workerId: string): boolean {
	const queue = this as IQueueDocument;

	return queue.workers.some((el) => el._id.toString() === workerId);
};

QueueSchema.statics.findByCode = async function (
	code: string
): Promise<IQueueDocument | null> {
	const model: IQueueModel = this as IQueueModel;
	const queue = await model.findOne({ code, status: "on" });

	if (!queue) {
		return null;
	}

	await queue.populateAll();

	return queue;
};

QueueSchema.statics.findLastPositionOfTicket = async function (
	queueId: string
): Promise<number> {
	const model: IQueueModel = this as IQueueModel;
	const queue = await model.findById(queueId);

	await queue?.populateAll();

	const approvedTickets: any[] = (queue?.tickets as any[]).filter(
		(el) => el.approved === true
	);

	if (approvedTickets && approvedTickets.length > 0) {
		const lastTicket = approvedTickets.reduce((prev, curr) =>
			prev.position > curr.position ? prev : curr
		);

		return lastTicket.position;
	}

	return 0;
};

interface IQueueMethods {}

interface IQueueModel extends Model<IQueueDocument, {}, IQueueMethods> {
	findLastPositionOfTicket: (queueId: string) => Promise<number>;
	findByCode(code: string): Promise<IQueueDocument | null>;
}

const QueueModel: IQueueModel = model<IQueueDocument, IQueueModel>(
	"Queues",
	QueueSchema
);

export { IQueueDocument, IQueueMethods, IQueueModel, QueueModel, TQueue };
