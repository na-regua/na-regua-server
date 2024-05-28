import { cloudinaryDestroy } from "@config/multer";
import { HttpException } from "@core/HttpException/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { errorHandler } from "@core/errorHandler/errorHandler";
import { Request, Response } from "express";
import { IUserDocument, TUser, UsersModel } from ".";
import { FilesModel, TUploadedFile } from "../Files";
import { TwilioRepository } from "../Twilio";
import { BarbersModel, TBarber } from "../Barbers";

class UsersRepository {
	async list(_: Request, res: Response): Promise<Response<TUser[]>> {
		try {
			const users = await UsersModel.find().populate("avatar", "-_id");

			return res.status(200).json(users);
		} catch (err: any) {
			return errorHandler(err, res);
		}
	}

	async create(req: Request, res: Response): Promise<Response<TUser>> {
		try {
			const file = req.file as TUploadedFile;
			const body = req.body;

			if (!file) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			const avatarFile = await FilesModel.create({
				original_name: file.originalname,
				filename: file.filename,
				url: file.path,
				mimetype: file.mimetype,
			});

			body.avatar = avatarFile._id;

			const user = await UsersModel.create(body);

			await user.populate("avatar", "-_id");

			return res.status(201).json(user);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async update(req: Request, res: Response): Promise<Response<null>> {
		try {
			const user: IUserDocument = res.locals.user;

			const body = req.body;

			await user.updateOne(body);

			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response): Promise<Response<null>> {
		try {
			const { id } = req.params;

			const user = await UsersModel.findById(id);

			if (!user) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			const avatarFile = await FilesModel.findById(user.avatar);

			if (avatarFile) {
				await cloudinaryDestroy(avatarFile.filename);
				await avatarFile.deleteOne();
			}

			await user.deleteOne();

			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async sendWhatsappCode(
		req: Request,
		res: Response
	): Promise<Response<{ goToVerify: boolean }>> {
		try {
			const { phone } = req.body;

			await UsersModel.findByPhone(phone);

			await TwilioRepository.sendOTP(phone);

			return res.status(200).json({ goToVerify: true });
		} catch (error: any) {
			return errorHandler(error, res);
		}
	}

	async verifySms(req: Request, res: Response): Promise<Response> {
		try {
			const { code, phone } = req.body;

			const user = await UsersModel.findByPhone(phone);

			const verification = await TwilioRepository.verifyOTP(code, phone);

			if (verification instanceof Error) {
				throw verification;
			}

			if (!verification || !verification.valid) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_CODE);
			}

			await user.updateOne({ verified: true });

			return res.status(200).json(verification);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async favoriteBarber(req: Request, res: Response): Promise<Response<null>> {
		try {
			const { barberId } = req.params;

			const user: IUserDocument = res.locals.user;

			const barber = await BarbersModel.findById(barberId);

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			const isFavorite =
				user.favorites &&
				user.favorites.some((fav) => fav._id.toString() === barberId);

			if (isFavorite) {
				await user.updateOne({ $pull: { favorites: barberId } });
			}

			if (!isFavorite) {
				await user.updateOne({ $push: { favorites: barberId } });
			}

			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async listFavorites(
		req: Request,
		res: Response
	): Promise<Response<TBarber[]>> {
		try {
			const user: IUserDocument = res.locals.user;

			const barbers = await BarbersModel.find({ _id: { $in: user.favorites } });

			await Promise.all(
				barbers.map(async (barber) => {
					await barber.populateAll();
				})
			);

			return res.status(200).json(barbers);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new UsersRepository();
