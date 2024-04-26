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
		workers: {
			type: [Schema.Types.ObjectId],
			ref: "Workers",
		},
		customers: {
			type: [Schema.Types.ObjectId],
			ref: "Customers",
		},
		schedules: {
			type: [String],
		},
		showServed: Boolean,
		servedCustomers: {
			type: [Schema.Types.ObjectId],
			ref: "Customers",
		},
		missedCustomers: {
			type: [Schema.Types.ObjectId],
			ref: "Customers",
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
	populateCustomers(): Promise<void>;
	hasCustomerOnQueue(customerId: string): boolean;
	hasWorkerOnQueue(workerId: string): boolean;
}

QueueSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });

QueueSchema.methods.populateCustomers = async function () {
	const queue = this as IQueueDocument;

	await queue.populate({
		path: "workers",
		populate: { path: "user" },
	});
	await queue.populate({
		path: "customers",
		populate: { path: "user service" },
		options: {
			sort: {
				approved: 1,
				position: 0,
			},
		},
	});

	await queue.populate("servedCustomers missedCustomers");
};

QueueSchema.methods.hasCustomerOnQueue = function (
	customerId: string
): boolean {
	const queue = this as IQueueDocument;

	return queue.customers.some((el) => el._id.toString() === customerId);
};

QueueSchema.methods.hasWorkerOnQueue = function (workerId: string): boolean {
	const queue = this as IQueueDocument;

	return queue.workers.some((el) => el._id.toString() === workerId);
};

QueueSchema.statics.findLastPositionOfQueueCustomer = async function (
	queueId: string
): Promise<number> {
	const model: IQueueModel = this as IQueueModel;
	const queue = await model.findById(queueId);

	await queue?.populateCustomers();

	const approvedCustomers: any[] = (queue?.customers as any[]).filter(
		(el) => el.approved === true
	);

	if (approvedCustomers && approvedCustomers.length > 0) {
		const lastCustomer = approvedCustomers.reduce((prev, curr) =>
			prev.position > curr.position ? prev : curr
		);

		return lastCustomer.position;
	}

	return 0;
};

interface IQueueMethods {}

interface IQueueModel extends Model<IQueueDocument, {}, IQueueMethods> {
	findLastPositionOfQueueCustomer: (queueId: string) => Promise<number>;
}

const QueueModel: IQueueModel = model<IQueueDocument, IQueueModel>(
	"Queues",
	QueueSchema
);

export { QueueModel, IQueueDocument, IQueueMethods, IQueueModel, TQueue };
