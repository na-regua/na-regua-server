import { HttpException } from "@core/HttpException/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import { errorHandler } from "@core/errorHandler/errorHandler";
import { generateRandomCode } from "@utils/index";
import { Request, Response } from "express";
import { FilesModel, TUploadedFile } from "../Files/FilesSchema";
import { ServicesModel } from "../Services";
import { TwilioRepository } from "../Twilio";
import { TUser, UsersModel } from "../Users";
import { WorkersModel } from "../Workers";
import { BarbersModel, IBarberDocument, TBarber } from "./BarbersSchema";

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
			const barber: IBarberDocument = res.locals.barber;

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			await barber.populate({
				path: "workers",
				populate: {
					path: "user",
					populate: {
						path: "avatar",
					},
				},
			});

			await barber.populate({
				path: "services",
			});

			return res.status(200).json(barber);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async update(req: Request, res: Response): Promise<Response<null>> {
		try {
			const barber: IBarberDocument = res.locals.barber;

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			const body = req.body;

			await barber.updateOne(body);

			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(_: Request, res: Response): Promise<Response<null>> {
		try {
			const barber: IBarberDocument = res.locals.barber;

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			await barber.deleteOne().then(async () => {
				for (const worker of barber.workers) {
					await WorkersModel.findByIdAndDelete(worker._id);
				}

				for (const service of barber.services) {
					await ServicesModel.findByIdAndDelete(service._id);
				}

				await FilesModel.findByIdAndDelete(barber.avatar._id);

				for (const thumb of barber.thumbs) {
					await FilesModel.findByIdAndDelete(thumb._id);
				}
			});

			// TO DO - check delete users and workers logic

			return res.status(204).json(null);
		} catch (err: any) {
			return errorHandler(err, res);
		}
	}

	async completeProfile(req: Request, res: Response): Promise<Response<null>> {
		try {
			const barber: IBarberDocument = res.locals.barber;

			await barber.save();

			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async signUp(
		req: Request,
		res: Response
	): Promise<Response<{ barber: TBarber; user: TUser }>> {
		try {
			const { password, ...body } = req.body;
			const files = req.files as TUploadedFile[];

			const createdFiles = [];

			for (const thumb of files) {
				const file = await FilesModel.create({
					filename: thumb.filename,
					originalName: thumb.originalname,
					url: thumb.path,
					mimeType: thumb.mimetype,
				});

				createdFiles.push(file._id);
			}

			const [avatar, ...thumbs] = createdFiles.map((file) => file._id);

			const barber = await BarbersModel.create({
				code: generateRandomCode(),
				thumbs,
				avatar,
				...body,
			});

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_CREATED);
			}

			res.locals.barber = barber;

			const adminUser = await UsersModel.create({
				name: barber.name,
				email: barber.email,
				phone: barber.phone,
				password: password,
				role: "admin",
				avatar,
			});

			if (!adminUser) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_CREATED);
			}

			res.locals.user = adminUser;

			const adminWorker = await WorkersModel.create({
				user: adminUser._id,
				barber: barber._id,
			});

			if (!adminWorker) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_CREATED);
			}

			await adminUser.updateOne({
				worker: adminWorker._id,
			});

			res.locals.worker = adminWorker;

			barber.workers.push(adminWorker._id);

			await barber.save();

			await TwilioRepository.sendOTP(adminUser.phone);

			return res.status(201).json({ barber, user: adminUser });
		} catch (error) {
			const { barber, user, worker } = res.locals;

			if (barber) {
				await barber.deleteOne();
			}
			if (user) {
				await user.deleteOne();
			}
			if (worker) {
				await worker.deleteOne();
			}

			return errorHandler(error, res);
		}
	}
}

export default new BarbersRepository();
