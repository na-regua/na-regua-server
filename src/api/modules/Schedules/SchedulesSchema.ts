import { InferSchemaType, Schema, Document, Model, model } from "mongoose";

const SchedulesSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "Users",
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
		date: {
			type: Date,
			required: true,
		},
		time: {
			type: String,
			required: true,
		},
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Schedules",
	}
);

type TSchedules = InferSchemaType<typeof SchedulesSchema>;

interface ISchedulesDocument extends TSchedules, Document {}

interface ISchedulesMethods {}

interface ISchedulesModel
	extends Model<ISchedulesDocument, {}, ISchedulesMethods> {}

const SchedulesModel: ISchedulesModel = model<
	ISchedulesDocument,
	ISchedulesModel
>("Schedules", SchedulesSchema);

export { TSchedules, ISchedulesDocument, SchedulesModel };
