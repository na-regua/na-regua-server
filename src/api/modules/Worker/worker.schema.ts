import mongoose from "mongoose";

const WorkerSchema = new mongoose.Schema(
	{
		barberId: {
			type: mongoose.Schema.Types.ObjectId,
		}
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Workers",
	}
);

export { WorkerSchema };
