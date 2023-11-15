import { Model, model } from "mongoose";
import { Document, InferSchemaType, Schema } from "mongoose";

const FilesSchema = new Schema(
	{
		filename: {
			type: String,
			required: true,
			unique: true,
		},
		originalName: {
			type: String,
		},
		localPath: {
			type: String,
		},
		url: {
			type: String,
			required: true,
		},
	},
	{
		versionKey: false,
		timestamps: false,
		collection: "Files",
	}
);

type TFile = InferSchemaType<typeof FilesSchema>;

interface IFileDocument extends TFile, Document {}

interface IFilesMethods {}

interface IFilesModel extends Model<IFileDocument, IFilesMethods> {}

const FilesModel: IFilesModel = model<IFileDocument, IFilesModel>(
	"Files",
	FilesSchema
);

type TUploadedFile = {
	fieldname: string; // file
	originalname: string; // myPicture.png
	encoding: string; // 7bit
	mimetype: string; // image/png
	destination: string; // ./public/uploads
	filename: string; // 1571575008566-myPicture.png
	path: string; // public/uploads/1571575008566-myPicture.png
	size: number; // 1255
};

export {
	FilesModel,
	FilesSchema,
	IFileDocument,
	IFilesModel,
	TFile,
	TUploadedFile,
};
