import { cloudinaryDestroy, handleMultipleUploadFile } from "@config/multer/";
import { HttpException } from "@core/HttpException/HttpException";
import { errorHandler } from "@core/errorHandler/errorHandler";
import { SYSTEM_ERRORS } from "@core/index";
import { Request, Response } from "express";
import { BarbersModel, IBarberDocument } from "../Barbers";
import { IUserDocument } from "../Users";
import { FilesModel, TFile, TUploadedFile } from "./FilesSchema";

class FilesRepository {
	async update_user_avatar(req: Request, res: Response) {
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
					original_name: file.originalname,
					filename: file.filename,
					url: file.path,
					mimetype: file.mimetype,
				}),
			]);

			const updatedFile = await FilesModel.findById(avatarId);

			return res.status(200).json(updatedFile);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async update_barber_avatar(req: Request, res: Response) {
		try {
			const barber: IBarberDocument = res.locals.barber;

			const { avatarId } = req.params;

			if (!avatarId) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			if (barber.avatar && barber.avatar._id.toString() !== avatarId) {
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
					original_name: file.originalname,
					filename: file.filename,
					url: file.path,
					mimetype: file.mimetype,
				}),
			]);

			const updatedFile = await FilesModel.findById(avatarId);

			await BarbersModel.updateLiveInfo(barber._id.toString());

			return res.status(200).json(updatedFile);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async update_barber_thumb(req: Request, res: Response) {
		try {
			const barber = res.locals.barber as IBarberDocument;
			const file = req.file as TUploadedFile;
			const thumbId = req.params.thumbId;

			res.locals.file = file;

			if (!file) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_SENT);
			}

			if (!thumbId) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			/*
			 * Create new thumbs
			 */
			const newThumb = await FilesModel.create({
				original_name: file.originalname,
				filename: file.filename,
				url: file.path,
				mimetype: file.mimetype,
			});

			if (!newThumb) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_CREATED);
			}

			await barber.updateOne({
				$push: {
					thumbs: newThumb._id,
				},
			});

			// Delete old thumbs

			const oldThumb = await FilesModel.findByIdAndDelete(thumbId);

			if (!oldThumb) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			await cloudinaryDestroy(oldThumb.filename);
			await barber.updateOne({
				$pull: {
					thumbs: thumbId,
				},
			});

			await BarbersModel.updateLiveInfo(barber._id.toString());

			return res.status(201).json(null);
		} catch (error) {
			const file = res.locals.file as TUploadedFile;

			// Delete file from cloudinary if it was uploaded to barber
			if (file) {
				await cloudinaryDestroy(file.filename);
			}

			return errorHandler(error, res);
		}
	}

	async upload_barber_thumbs(req: Request, res: Response) {
		try {
			const files = req.files as TUploadedFile[];
			const barber = res.locals.barber as IBarberDocument;

			if (!files) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_SENT);
			}

			// Create new files
			await Promise.all(
				files.map(async (file) => {
					const new_thumb = await FilesModel.create({
						original_name: file.originalname,
						filename: file.filename,
						url: file.path,
						mimetype: file.mimetype,
					});

					if (!new_thumb) {
						throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_CREATED);
					}

					await barber.updateOne({
						$push: {
							thumbs: new_thumb._id,
						},
					});
				})
			);

			return res.status(201).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete_barber_thumb(req: Request, res: Response) {
		try {
			const thumb_id = req.params.thumbId;
			const barber = res.locals.barber as IBarberDocument;
			if (!thumb_id) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			const thumb = await FilesModel.findById(thumb_id);

			if (!thumb) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			await cloudinaryDestroy(thumb.filename);
			await thumb.deleteOne();
			await barber.updateOne({
				$pull: {
					thumbs: thumb_id,
				},
			});

			return res.status(200).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new FilesRepository();
