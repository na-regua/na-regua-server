import { cloudinaryDestroy, handleMultipleUploadFile } from "@config/multer/";
import { HttpException } from "@core/HttpException/HttpException";
import { errorHandler } from "@core/errorHandler/errorHandler";
import { SYSTEM_ERRORS } from "@core/index";
import { Request, Response } from "express";
import { IBarberDocument } from "../Barbers";
import { IUserDocument } from "../Users";
import { FilesModel, TFile, TUploadedFile } from "./FilesSchema";

class FilesRepository {
	async updateUserAvatar(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;
			const { avatarId } = req.params;

			if (!user) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			if (user.avatar._id.toString() !== avatarId) {
				throw new HttpException(403, SYSTEM_ERRORS.FORBIDDEN);
			}

			const file = req.file as TUploadedFile;

			if (!file) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			const avatarFile = await FilesModel.findById(avatarId);

			if (!avatarFile) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			await Promise.all([
				cloudinaryDestroy(avatarFile.filename),
				avatarFile.updateOne({
					originalName: file.originalname,
					filename: file.filename,
					url: file.path,
				}),
			]);

			const updatedFile = await FilesModel.findById(avatarId);

			return res.status(200).json(updatedFile);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async updateBarberAvatar(req: Request, res: Response) {
		try {
			const barber: IBarberDocument = res.locals.barber;

			const { avatarId } = req.params;

			if (!avatarId) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			if (barber.avatar._id.toString() !== avatarId) {
				throw new HttpException(403, SYSTEM_ERRORS.FORBIDDEN);
			}

			const file = req.file as TUploadedFile;

			if (!file) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_SENT);
			}

			const avatarFile = await FilesModel.findById(avatarId);

			if (!avatarFile) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			await Promise.all([
				cloudinaryDestroy(avatarFile.filename),
				avatarFile.updateOne({
					originalName: file.originalname,
					filename: file.filename,
					url: file.path,
				}),
			]);

			const updatedFile = await FilesModel.findById(avatarId);

			return res.status(200).json(updatedFile);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async uploadFileToStorage(
		req: Request,
		res: Response
	): Promise<Response<null>> {
		try {
			const uploadResult = await handleMultipleUploadFile(req, res);

			const uploadedFiles: TUploadedFile[] = uploadResult.files;

			const createdFiles: TFile[] = [];

			const createFilesPromise = new Promise<void>((resolve) => {
				uploadedFiles.map(async (uploadedFile) => {
					const createdFile = await FilesModel.create({
						filename: uploadedFile.filename,
						url: `uploads/${uploadedFile.filename}`,
					});

					createdFiles.push(createdFile);

					if (createdFiles.length === uploadedFiles.length) {
						resolve();
					}
				});
			});

			await createFilesPromise;

			return res.status(200).json(createdFiles);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new FilesRepository();
