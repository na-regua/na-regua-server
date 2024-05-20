import { Document, InferSchemaType, Model, Schema, model } from "mongoose";

export type NotificationMessageType =
	| "CUSTOMER_JOINED_QUEUE"
	| "USER_ASK_TO_JOIN_QUEUE"
	| "CUSTOMER_LEFT_QUEUE"
	| "USER_ASK_TO_SCHEDULE"
	| "USER_WILL_BE_LATE_TO_APPOINTMENT"
	| "CUSTOMER_SCHEDULED_APPOINTMENT"
	| "CUSTOMER_CANCELLED_APPOINTMENT"
	| "USER_REJECTED_APPOINTMENT_RESCHEDULE"
	| "GENERATED_STATEMENT"
	| "WORKER_ADD_USER_AS_CUSTOMER"
	| "OTHERS";

const NotificationMessageType: NotificationMessageType[] = [
	"CUSTOMER_JOINED_QUEUE",
	"CUSTOMER_LEFT_QUEUE",
	"CUSTOMER_SCHEDULED_APPOINTMENT",
	"CUSTOMER_CANCELLED_APPOINTMENT",
	"USER_ASK_TO_JOIN_QUEUE",
	"USER_ASK_TO_SCHEDULE",
	"USER_WILL_BE_LATE_TO_APPOINTMENT",
	"USER_REJECTED_APPOINTMENT_RESCHEDULE",
	"GENERATED_STATEMENT",
	"WORKER_ADD_USER_AS_CUSTOMER",
	"OTHERS",
];

const NotificationDataSchema = new Schema(
	{
		service: {
			type: Schema.Types.ObjectId,
			ref: "Services",
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "Users",
		},
		customer: {
			type: Schema.Types.ObjectId,
			ref: "Users",
		},
		worker: {
			type: Schema.Types.ObjectId,
			ref: "Workers",
		},
	},
	{ _id: false, versionKey: false }
);

const NotificationSchema = new Schema(
	{
		to: {
			type: Schema.Types.ObjectId,
			ref: "Users",
			required: true,
		},
		message: {
			type: String,
			required: true,
			enum: NotificationMessageType,
			default: "OTHERS",
		},
		data: {
			type: NotificationDataSchema,
		},
		read: {
			type: Boolean,
			default: false,
		},
		icon: {
			type: Schema.Types.ObjectId,
			ref: "Files",
		},
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Notifications",
	}
);

type TNotification = InferSchemaType<typeof NotificationSchema>;

interface INotificationDocument extends TNotification, Document {}

export const populateNotifications = async function (
	arr: INotificationDocument[]
) {
	return Promise.all(
		arr.map(async (notification) => {
			await notification.populate("icon");
			await notification.populate("to");
			await notification.populate("data.service");
			await notification.populate("data.user");
			await notification.populate("data.customer");
			await notification.populate({
				path: "data.worker",
				populate: { path: "user barber" },
			});

			return notification;
		})
	);
};

interface INotificationModel extends Model<INotificationDocument> {
	populateData(): Promise<INotificationDocument>;
}

const NotificationsModel: INotificationModel = model<
	INotificationDocument,
	INotificationModel
>("Notifications", NotificationSchema);

export { NotificationsModel, INotificationDocument, TNotification };
