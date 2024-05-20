import { cloudinaryDestroy } from "@config/multer";
import { HttpException, SYSTEM_ERRORS, errorHandler } from "@core/index";
import { diacriticSensitiveRegex, generateRandomCode } from "@utils/index";
import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { FilesModel, IFileDocument, TUploadedFile } from "../Files/FilesSchema";
import { ServicesModel } from "../Services";
import { TUser, UsersModel } from "../Users";
import { WorkersModel } from "../Workers";
import { BarbersModel, IBarberDocument, TBarber } from "./BarbersSchema";

class BarbersRepository {
	async index(req: Request, res: Response): Promise<Response<TBarber>> {
		try {
			const { search } = req.query;

			let filterQuery: FilterQuery<IBarberDocument> = {};

			const cleanedSearch = diacriticSensitiveRegex(
				(search as string).toLocaleLowerCase()
			);

			if (search && typeof search === "string") {
				filterQuery = {
					$or: [
						{ name: { $regex: new RegExp("^" + cleanedSearch, "i") } },
						{ code: { $regex: new RegExp("^" + cleanedSearch, "i") } },
					],
				};
			}

			const barbers = await BarbersModel.find(filterQuery);

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

	async byToken(_: Request, res: Response): Promise<Response<TBarber>> {
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

			await barber.populateAll();

			await barber.deleteOne().then(async () => {
				const workers = await WorkersModel.find({ barber: barber._id });

				for (const worker of workers) {
					await WorkersModel.findByIdAndDelete(worker._id);
				}

				const services = await ServicesModel.find({ barber: barber._id });

				for (const service of services) {
					await ServicesModel.findByIdAndDelete(service._id);
				}

				const avatar = await FilesModel.findById(barber.avatar);

				if (avatar) {
					await avatar.deleteOne();
					await cloudinaryDestroy(avatar.filename);
				}

				const thumbs = await FilesModel.find({ _id: { $in: barber.thumbs } });

				for (const thumb of thumbs) {
					await thumb.deleteOne();
					await cloudinaryDestroy(thumb.filename);
				}
			});

			return res.status(204).json(null);
		} catch (err: any) {
			return errorHandler(err, res);
		}
	}

	async completeProfile(req: Request, res: Response): Promise<Response<null>> {
		try {
			const barber: IBarberDocument = res.locals.barber;

			await barber.updateOne({
				profileStatus: "completed",
			});

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
			const { password, address, phone, ...body } = req.body;
			const files = req.files as TUploadedFile[];

			res.locals.cloudFiles = files;

			const createdFiles = [];
			const createdFilesSchema = [];
			/*
			 * Uploaded files to cloud service and create Files Scchema
			 **/
			for (const thumb of files) {
				const file = await FilesModel.create({
					filename: thumb.filename,
					original_name: thumb.originalname,
					url: thumb.path,
					mimetype: thumb.mimetype,
				});

				createdFiles.push(file._id);
				createdFilesSchema.push(file);

				res.locals.files = createdFilesSchema;
			}

			/*
			 * Map avatar schema and thumb schema, all files via endpoint are the same, so the first should be the avatar file
			 **/
			const [avatar, ...thumbs] = createdFiles.map((file) => file._id);
			const parsedAddress = JSON.parse(address);
			const numPhone = +phone;

			const barber = await BarbersModel.create({
				code: generateRandomCode(),
				thumbs,
				avatar,
				address: parsedAddress,
				phone: numPhone,
				...body,
			});

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_CREATED);
			}

			/*
			 * All created variables will be setted to res.locals to be deleted if had an error
			 **/

			res.locals.barber = barber;

			/*
			 * Create the admin user for the barber login
			 **/
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

			/*
			 * Create the admin worker for the registry
			 **/
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

			const access_token = await adminUser.generateAuthToken();

			const updatedBarber = await BarbersModel.findByIdAndUpdate(barber._id);

			return res
				.status(201)
				.json({ barber: updatedBarber, user: adminUser, access_token });
		} catch (error) {
			const { barber, user, worker } = res.locals;
			const cloudFiles = res.locals.cloudFiles as TUploadedFile[];

			const files = res.locals.files as IFileDocument[];

			if (barber) {
				await barber.deleteOne();
			}

			if (user) {
				await user.deleteOne();
			}

			if (worker) {
				await worker.deleteOne();
			}

			if (files) {
				files.map(async (file) => {
					await cloudinaryDestroy(file.filename);
					await file.deleteOne();
				});
			}

			if (cloudFiles) {
				cloudFiles.forEach(async (file) => {
					await cloudinaryDestroy(file.filename);
				});
			}

			return errorHandler(error, res);
		}
	}

	async openBarber(req: Request, res: Response): Promise<Response<null>> {
		try {
			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async closeBarber(req: Request, res: Response): Promise<Response<null>> {
		try {
			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new BarbersRepository();
