import { HttpException } from "@core/HttpException/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { errorHandler } from "@core/errorHandler/errorHandler";
import { Request, Response } from "express";
import { TUser, UsersModel } from ".";
import { TwilioRepository } from "../Twilio";

class UsersRepository {
	async index(_: Request, res: Response): Promise<Response<TUser[]>> {
		try {
			const users = await UsersModel.find().populate("avatar", "-_id");

			return res.status(200).json(users);
		} catch (err: any) {
			return errorHandler(err, res);
		}
	}

	async create(req: Request, res: Response): Promise<Response<TUser>> {
		try {
			const body = req.body;
			const file = req.file;

			if (!file) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			body.avatar = file.buffer;

			const user = await UsersModel.create(body);

			return res.status(201).json(user);
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

			await user.deleteOne();

			return res.status(204).json(null);
		} catch (err: any) {
			return errorHandler(err, res);
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

			await user.updateOne({ phoneConfirmed: true });

			return res.status(200).json(verification);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new UsersRepository();
