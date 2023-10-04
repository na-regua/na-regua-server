import { HttpException } from "@core/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { errorHandler } from "@core/errorHandler";
import { NextFunction, Request, Response } from "express";
import { BarbersModel, TBarber } from "../Barbers";
import { TwilioRepository } from "../Twilio";
import { IUserDocument, TUser, UsersModel } from "../Users";

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

			const accessToken = await user.generateAuthToken();

			return res.status(200).json({ user, accessToken });
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

			await TwilioRepository.sendOTP(phone);

			return res.status(200).json({ goToVerify: true });
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
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async verifyPhone(
		req: Request,
		res: Response
	): Promise<Response<{ user: TUser; accessToken: string }>> {
		try {
			const { code, phone } = req.body;

			const user = await UsersModel.findOne({ phone });

			if (!user) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			const verification = await TwilioRepository.verifyOTP(code, phone);

			if (verification instanceof Error) {
				throw verification;
			}

			if (!verification || !verification.valid) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_CODE);
			}

			await user.updateOne({ phoneConfirmed: true });

			const accessToken = await user.generateAuthToken();

			return res.status(200).json({ user, accessToken });
		} catch (error: any) {
			if (error.code) {
				return errorHandler(new HttpException(400, error.code), res);
			}

			return errorHandler(error, res);
		}
	}

	async isAuthenticated(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			let token = req.headers.authorization;

			if (!token) {
				throw new HttpException(403, SYSTEM_ERRORS.FORBIDDEN);
			}

			token = token.replace("Bearer", "").trim();

			const user = await UsersModel.findByToken(token);

			res.locals.user = user;

			next();
		} catch (err: any) {
			throw errorHandler(err, res);
		}
	}

	async isAdmin(_: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { user } = res.locals;

			if (!user) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			if (user.role !== "admin") {
				throw new HttpException(400, SYSTEM_ERRORS.FORBIDDEN);
			}

			next();
		} catch (err: any) {
			throw errorHandler(err, res);
		}
	}

	async getCurrentUser(
		_: Request,
		res: Response
	): Promise<
		Response<{
			user: TUser;
			barber?: TBarber;
		}>
	> {
		try {
			const user: IUserDocument = res.locals.user;
			const response: { user: TUser; barber?: TBarber } = {
				user,
			};

			if (!user) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			if (user.role === "admin") {
				const barber = await BarbersModel.findOne({ user: user._id }).populate(
					"user"
				);

				if (!barber) {
					throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
				}

				response.barber = barber;
			}

			return res.status(200).json(response);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new AuthRepository();
