import { HttpException } from "@core/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { errorHandler } from "@core/errorHandler";
import { Request, Response } from "express";
import { TUser, UsersModel } from "../Users";
import { TwilioRepository } from "../Twilio";

class AuthRepository {
	async loginWithEmail(
		req: Request,
		res: Response
	): Promise<Response<{ user: TUser; accessToken: string }>> {
		try {
			const { email, password } = req.body;

			if (!email) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_EMAIL);
			}

			if (!password) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_PASSWORD);
			}

			const user = await UsersModel.findByCredentials(email, password);

			if (!user.generateAuthToken) {
				throw new HttpException(500, SYSTEM_ERRORS.INTERNAL_SERVER_ERROR);
			}

			const token = await user.generateAuthToken();

			return res.status(200).json({ user, token });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async loginWithPhone(
		req: Request,
		res: Response
	): Promise<Response<{ goToVerify: boolean }>> {
		try {
			const { phone } = req.body;

			if (!phone) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_PHONE_NUMBER);
			}

			const user = await UsersModel.findOne({ phone });

			if (!user) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			if (!user.generateAuthToken) {
				throw new HttpException(500, SYSTEM_ERRORS.INTERNAL_SERVER_ERROR);
			}

			return res.status(200).json({ goToVerify: true });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async verifyPhone(req: Request, res: Response): Promise<any> {
		try {
			const { code, phone } = req.body;

			const verification = await TwilioRepository.verifyOTP(code, phone);

			if (verification instanceof Error) {
				throw verification;
			}

			if (!verification || !verification.valid) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_CODE);
			}

			const user = await UsersModel.findOne({ phone });

			if (!user) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			if (!user.generateAuthToken) {
				throw new HttpException(500, SYSTEM_ERRORS.INTERNAL_SERVER_ERROR);
			}

			const token = await user.generateAuthToken();

			return res.status(200).json({ user, token });
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new AuthRepository();
