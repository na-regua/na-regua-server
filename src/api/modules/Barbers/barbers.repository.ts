import { HttpException } from "@core/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { errorHandler } from "@core/errorHandler";
import { Request, Response } from "express";
import { generateCodeByName } from "src/utils";
import { TwilioRepository } from "../Twilio";
import { UsersModel } from "../Users";
import { BarbersModel } from "./Barbers.model";
import { TBarber } from "./Barbers.schema";

class BarbersRepository {
	async index(_: Request, res: Response): Promise<Response<TBarber[]>> {
		try {
			const barbers = await BarbersModel.find();

			return res.status(200).json(barbers);
		} catch (err: any) {
			return errorHandler(err, res);
		}
	}

	async show(_: Request, res: Response): Promise<Response<TBarber>> {
		try {
			const { user } = res.locals;

			if (!user) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			const barber = await BarbersModel.findOne({ user: user._id })
				.populate("user")
				.populate("workers")
				.populate("services");
			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			return res.status(200).json(barber);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async preSignIn(req: Request, res: Response): Promise<Response<TBarber>> {
		try {
			const { user: textUser, ...body } = req.body;
			const files = req.files;

			const user = JSON.parse(textUser);

			if (!user) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			if (!files) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			const avatar = (files as any)[0];

			const adminUser = await UsersModel.create({
				...user,
				avatar: avatar.buffer,
				role: "admin",
			});

			const thumbs = req.files;

			const newBarber: TBarber = {
				user: adminUser._id,
				avatar: avatar.buffer,
				code: generateCodeByName(),
				...body,
			};

			newBarber.thumbs = (thumbs as any[]).map((thumb) => thumb.buffer);

			const barber = await BarbersModel.create(newBarber).catch(async (err) => {
				await adminUser.deleteOne();

				throw err;
			});

			if (!barber) {
				throw new HttpException(400, "teste");
			}

			await barber.populate("user");

			await TwilioRepository.sendOTP(user.phone);

			return res.status(201).json(barber);
		} catch (err: any) {
			return errorHandler(err, res);
		}
	}

	async update(req: Request, res: Response): Promise<Response<null>> {
		try {
			const body = req.body;

			const { id } = req.params;

			const barber = await BarbersModel.findById(id);

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			await barber.updateOne(body);
			await barber.save();

			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response): Promise<Response<null>> {
		try {
			const { id } = req.params;

			const barber = await BarbersModel.findById(id).populate("user");

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			if (!!barber.user && barber.user._id) {
				await UsersModel.findByIdAndDelete(barber.user._id);
			}

			await barber.deleteOne();

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
}

export default new BarbersRepository();
