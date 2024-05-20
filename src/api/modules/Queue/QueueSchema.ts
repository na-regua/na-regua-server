import { getTodayAndNextTo } from "@utils/date";
import {
	Document,
	FilterQuery,
	InferSchemaType,
	Model,
	Schema,
	model,
} from "mongoose";
import { ITicketsDocument } from "../Tickets";
const uniqueValidator = require("mongoose-unique-validator");

const QueueSchema = new Schema(
	{
		status: {
			type: String,
			enum: ["on", "off", "paused"],
			default: "on",
		},
		workers: {
			type: [Schema.Types.ObjectId],
			ref: "Workers",
			required: true,
		},
		barber: {
			type: Schema.Types.ObjectId,
			ref: "Barbers",
			required: true,
		},
		schedules: {
			type: [Schema.Types.ObjectId],
			ref: "Tickets",
		},
		tickets: {
			type: [Schema.Types.ObjectId],
			ref: "Tickets",
		},
		serveds: {
			type: [Schema.Types.ObjectId],
			ref: "Tickets",
		},
		misseds: {
			type: [Schema.Types.ObjectId],
			ref: "Tickets",
		},
		finished: {
			type: Boolean,
			default: false,
		},
		finishedAt: {
			type: Date,
		},
		finishedBy: {
			type: Schema.Types.ObjectId,
			ref: "Workers",
		},
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Queues",
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
		populate: [
			{ path: "customer", populate: { path: "avatar" } },
			{ path: "service" },
		],
		options: {
			sort: {
				approved: 1,
				position: 0,
			},
		},
	});
	// await queue.populate({
	// 	path: "serveds",
	// 	populate: { path: ticketPopulatePath },
	// 	options: {
	// 		sort: {
	// 			approved: 1,
	// 			position: 0,
	// 		},
	// 	},
	// });
	// await queue.populate({
	// 	path: "misseds",
	// 	populate: {
	// 		path: ticketPopulatePath,
	// 	},
	// 	options: {
	// 		sort: {
	// 			approved: 1,
	// 			position: 0,
	// 		},
	// 	},
	// });
};

QueueSchema.statics.findLastPosition = async function (
	queueId: string
): Promise<number> {
	const model: IQueueModel = this as IQueueModel;
	const queue = await model.findById(queueId);

	await queue?.populateAll();

	const tickets: ITicketsDocument[] = ((queue?.tickets as any[]) || []).map(
		(el) => el
	);

	if (tickets && tickets.length > 0) {
		const positions = tickets.map((el) => el.queue?.position || 0);

		const bigger = Math.max(...positions);

		return bigger;
	}

	return 0;
};

QueueSchema.statics.findBarberTodayQueue = async function (
	barberId?: string,
	otherParams?: FilterQuery<IQueueDocument>
): Promise<IQueueDocument | null> {
	const model: IQueueModel = this as IQueueModel;
	const { nextDay, today } = getTodayAndNextTo(1);

	const params: FilterQuery<IQueueDocument> = {
		status: { $in: ["on", "paused"] },
		createdAt: {
			$gte: today,
			$lt: nextDay,
		},
		...otherParams,
	};

	if (barberId) {
		params.barber = barberId;
	}

	const queue = (await model.findOne(params)) as IQueueDocument;

	await queue?.populateAll();

	return queue;
};

interface IQueueMethods {}

interface IQueueModel extends Model<IQueueDocument, {}, IQueueMethods> {
	findLastPosition: (queueId: string) => Promise<number>;
	findBarberTodayQueue(barberId: string): Promise<IQueueDocument | null>;
	findQueueByCode(code: string): Promise<IQueueDocument | null>;
}

const QueueModel: IQueueModel = model<IQueueDocument, IQueueModel>(
	"Queues",
	QueueSchema
);

export { IQueueDocument, IQueueMethods, IQueueModel, QueueModel, TQueue };
