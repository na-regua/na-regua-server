import { Document, InferSchemaType, Model, Schema, model } from "mongoose";

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
		},
		viewed: {
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

interface INotificationModel extends Model<INotificationDocument> {}

const NotificationsModel: INotificationModel = model<
	INotificationDocument,
	INotificationModel
>("Notifications", NotificationSchema);

export { NotificationsModel, INotificationDocument, TNotification };
