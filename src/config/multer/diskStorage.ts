import { HttpException } from "@core/HttpException";
import { SYSTEM_ERRORS } from "@core/index";
import { Request, Response } from "express";
import multer from "multer";
import * as path from "path";

import { randomUUID } from "crypto";
import { TUploadedFile } from "@api/modules";

const uploadFilePath = path.resolve(__dirname, "../../", "public/uploads");

const storageFile: multer.StorageEngine = multer.diskStorage({
	destination: uploadFilePath,
	filename(
		req: Express.Request,
		file: Express.Multer.File,
		fn: (error: Error | null, filename: string) => void
	): void {
		fn(null, `${randomUUID()}${path.extname(file.originalname)}`);
	},
});

const uploadFile = multer({
	storage: storageFile,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter(req, file, callback) {
		const extension: boolean =
			[".png", ".jpg", ".jpeg"].indexOf(
				path.extname(file.originalname).toLowerCase()
			) >= 0;
		const mimeType: boolean =
			["image/png", "image/jpg", "image/jpeg"].indexOf(file.mimetype) >= 0;

		if (extension && mimeType) {
			return callback(null, true);
		}

		callback(new HttpException(400, SYSTEM_ERRORS.INVALID_FILE));
	},
}).single("file");

const handleSingleUploadFile = async (
	req: Request,
	res: Response
): Promise<{ file: TUploadedFile; body: any }> => {
	return new Promise((resolve, reject): void => {
		uploadFile(req, res, (error) => {
			if (error) {
				reject(error);
			}

			resolve({ file: req.file as TUploadedFile, body: req.body });
		});
	});
};

const uploadFileArray = multer({
	storage: storageFile,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter(req, file, callback) {
		const extension: boolean =
			[".png", ".jpg", ".jpeg"].indexOf(
				path.extname(file.originalname).toLowerCase()
			) >= 0;
		const mimeType: boolean =
			["image/png", "image/jpg", "image/jpeg"].indexOf(file.mimetype) >= 0;

		if (extension && mimeType) {
			return callback(null, true);
		}

		callback(new HttpException(400, SYSTEM_ERRORS.INVALID_FILE));
	},
}).array("files");

const handleMultipleUploadFile = async (
	req: Request,
	res: Response
): Promise<{ files: TUploadedFile[]; body: any }> => {
	return new Promise((resolve, reject): void => {
		uploadFileArray(req, res, (error) => {
			if (error) {
				reject(error);
			}

			resolve({ files: req.files as TUploadedFile[], body: req.body });
		});
	});
};

const fs = require("fs");
const { promisify } = require("util");

const handleRemoveFile = promisify(fs.unlink);

export { handleMultipleUploadFile, handleSingleUploadFile, handleRemoveFile };
