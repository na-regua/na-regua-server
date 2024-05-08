import { HttpException, SYSTEM_ERRORS, errorHandler } from "@core/index";
import { NextFunction, Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { BarbersModel, IBarberDocument, TBarber } from "../Barbers";
import { TwilioRepository } from "../Twilio";
import { IUserDocument, TUser, UsersModel } from "../Users";
import { WorkersModel } from "../Workers";

class AuthRepository {
	async loginWithEmail(
		req: Request,
		res: Response
	): Promise<Response<{ user: TUser; accessToken: string; barber: TBarber }>> {
		try {
			const { email, password } = req.body;

			if (!email) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_EMAIL);
			}

			if (!password) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_PASSWORD);
			}

			const user = await UsersModel.findByCredentials(email, password);

			await user.populate("avatar");
			const accessToken = await user.generateAuthToken();

			if (user.role !== "customer") {
				const worker = await WorkersModel.findOne({ user: user._id });

				if (!worker) {
					throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
				}

				const barber = await BarbersModel.findById(worker.barber);

				if (!barber) {
					throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
				}

				await barber.populateAll();

				return res.status(200).json({ accessToken, barber, user });
			}

			return res.status(200).json({ accessToken, user });
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async sendOTPCode(
		req: Request,
		res: Response
	): Promise<Response<{ goToVerify: boolean }>> {
		try {
			const { phone } = req.body;

			await UsersModel.findByPhone(phone);

			await TwilioRepository.sendOTP(phone);

			return res.status(200).json({ goToVerify: true });
		} catch (error: any) {
			if (error.code) {
				return errorHandler(new HttpException(400, error.code), res);
			}

			return errorHandler(error, res);
		}
	}

	async verifyOTPCode(
		req: Request,
		res: Response
	): Promise<Response<{ user: TUser; accessToken: string }>> {
		try {
			const { code, phone } = req.body;

			const user = await UsersModel.findByPhone(phone);

			const verification = await TwilioRepository.verifyOTP(code, phone);

			if (!verification || !verification.valid) {
				throw new HttpException(400, SYSTEM_ERRORS.INVALID_CODE);
			}

			await user.updateOne({ verified: true });
			await user.populate("avatar");

			const accessToken = await user.generateAuthToken();

			if (user.role === "admin" || user.role === "worker") {
				const worker = await WorkersModel.findOne({ user: user._id });

				if (!worker) {
					throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
				}

				const barber = await BarbersModel.findById(worker.barber);

				if (!barber) {
					throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
				}

				if (user.role === "admin" && barber.phone === user.phone) {
					await barber.updateOne({ verified: true });
				}

				await barber.populateAll();

				return res.status(200).json({ accessToken, barber, user });
			}

			return res.status(200).json({ accessToken, user });
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
	): Promise<any> {
		try {
			let token = req.headers.authorization;

			if (!token) {
				throw new HttpException(401, SYSTEM_ERRORS.UNAUTHORIZED);
			}

			token = token.replace("Bearer", "").trim();

			const user = await UsersModel.findByToken(token);
			await user.populate("avatar");

			if (!user) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			res.locals.user = user;

			next();
		} catch (err: any) {
			return errorHandler(err, res);
		}
	}

	async isAdmin(_: Request, res: Response, next: NextFunction): Promise<any> {
		try {
			const { user } = res.locals;

			if (user.role !== "admin") {
				throw new HttpException(403, SYSTEM_ERRORS.FORBIDDEN);
			}

			const worker = await WorkersModel.findOne({ user: user._id });

			if (!worker) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			const barber = await BarbersModel.findById(worker.barber);

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			res.locals.barber = barber;

			next();
		} catch (err: any) {
			return errorHandler(err, res);
		}
	}

	async workForBarber(
		_: Request,
		res: Response,
		next: NextFunction
	): Promise<any> {
		const { user } = res.locals;

		const worker = await WorkersModel.findOne({ user: user._id });

		if (!worker) {
			throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
		}

		const barber = await BarbersModel.findById(worker.barber);

		if (!barber) {
			throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
		}

		res.locals.worker = worker;
		res.locals.barber = barber;

		next();
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

			await user.populate("avatar");

			if (user.role === "admin" || user.role === "worker") {
				const worker = await WorkersModel.findOne({ user: user._id });

				if (!worker) {
					throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
				}

				const barber = await BarbersModel.findById(worker.barber);

				if (!barber) {
					throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
				}

				await barber.populateAll();

				response.barber = barber;
			}

			return res.status(200).json(response);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new AuthRepository();
