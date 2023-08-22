import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
	{
		barberId: {
			type: mongoose.Schema.Types.ObjectId,
		}
	},
	{
		versionKey: false,
		timestamps: true,
		collection: "Services",
	}
);

export { ServiceSchema };
