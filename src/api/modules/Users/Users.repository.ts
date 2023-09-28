import { HttpException } from "@core/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { errorHandler } from "@core/errorHandler";
import { NextFunction, Request, Response } from "express";
import { generateCodeByName } from "src/utils";
import { TwilioRepository } from "../Twilio";
import { TUser, UsersModel } from "../Users";

class UsersRepository {
	async index(_: Request, res: Response): Promise<Response<TUser[]>> {
		try {
			const users = await UsersModel.find();

			return res.status(200).json(users);
		} catch (err: any) {
			return errorHandler(err, res);
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

	async smsTest(req: Request, res: Response): Promise<Response<any>> {
		try {
			const { phone } = req.body;

			const OTP = await TwilioRepository.sendOTP(phone);

			return res.status(200).json(OTP);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async verifySms(req: Request, res: Response): Promise<Response> {
		try {
			const { code, phone } = req.body;

			const verification = await TwilioRepository.verifyOTP(code, phone);

			if (verification instanceof Error) {
				throw verification;
			}

			if (!verification || !verification.valid) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_CODE);
			}

			return res.status(200).json(verification);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new UsersRepository();
