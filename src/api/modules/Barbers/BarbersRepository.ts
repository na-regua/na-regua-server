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
	async list(req: Request, res: Response): Promise<Response<TBarber>> {
		try {
			const { search} = req.query;

			const limit = req.query.limit || 20;
			const offset = req.query.offset || 0;

			let filter_query: FilterQuery<IBarberDocument> = {};

			if (search) {
				const cleaned_search = diacriticSensitiveRegex(
					(search as string).toLocaleLowerCase()
				);

				if (search && typeof search === "string") {
					filter_query = {
						$or: [
							{ name: { $regex: new RegExp("^" + cleaned_search, "i") } },
							{ code: { $regex: new RegExp("^" + cleaned_search, "i") } },
						],
					};
				}
			}

			const total = await BarbersModel.find(filter_query).countDocuments();
			const barbers = await BarbersModel.find(filter_query)
				.limit(+limit)
				.skip(+offset);

			await Promise.all(
				barbers.map(async (barber) => {
					await barber.populateAll();
					await barber.updateRating();
				})
			);

			return res.status(200).json({ content: barbers, total, limit, offset});
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async find_by_token(_: Request, res: Response): Promise<Response<TBarber>> {
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

			await BarbersModel.updateLiveInfo(barber._id.toString(), {});

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

	async complete_profile(req: Request, res: Response): Promise<Response<null>> {
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

	async create(
		req: Request,
		res: Response
	): Promise<Response<{ barber: TBarber; user: TUser }>> {
		try {
			const { password, address, phone, ...body } = req.body;
			const files = req.files as TUploadedFile[];

			res.locals.cloud_files = files;

			const new_files = [];
			const new_files_schema = [];
			/*
			 * Uploaded files to cloud service and create Files Schema
			 **/
			for (const thumb of files) {
				const file = await FilesModel.create({
					filename: thumb.filename,
					original_name: thumb.originalname,
					url: thumb.path,
					mimetype: thumb.mimetype,
				});

				new_files.push(file._id);
				new_files_schema.push(file);

				res.locals.files = new_files_schema;
			}

			/*
			 * Map avatar schema and thumb schema, all files via endpoint are the same, so the first should be the avatar file
			 **/
			const [avatar, ...thumbs] = new_files.map((file) => file._id);
			const parsed_address = JSON.parse(address);
			const num_phone = +phone;

			let barber = await BarbersModel.create({
				code: generateRandomCode(),
				thumbs,
				avatar,
				address: parsed_address,
				phone: num_phone,
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
			const admin_user = await UsersModel.create({
				name: barber.name,
				email: barber.email,
				phone: barber.phone,
				password: password,
				role: "admin",
				avatar,
			});

			if (!admin_user) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_CREATED);
			}

			res.locals.user = admin_user;

			/*
			 * Create the admin worker for the registry
			 **/
			const admin_worker = await WorkersModel.create({
				user: admin_user._id,
				barber: barber._id,
			});

			if (!admin_worker) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_CREATED);
			}

			res.locals.worker = admin_worker;

			const access_token = await admin_user.generateAuthToken();

			const updated_user = await UsersModel.findByIdAndUpdate(admin_user._id, {
				worker: admin_worker._id,
			});

			return res.status(201).json({ barber, user: updated_user, access_token });
		} catch (error) {
			const { barber, user, worker } = res.locals;
			const cloud_files = res.locals.cloud_files as TUploadedFile[];

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

			if (cloud_files) {
				cloud_files.forEach(async (file) => {
					await cloudinaryDestroy(file.filename);
				});
			}

			return errorHandler(error, res);
		}
	}

	async set_is_open(req: Request, res: Response): Promise<Response<null>> {
		try {
			const { open } = req.body;
			const barber: IBarberDocument = res.locals.barber;

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			await barber.updateOne({
				open,
			});

			await BarbersModel.updateLiveInfo(
				barber._id.toString(),
				{},
				"BARBER_IS_ON"
			);

			return res.status(204).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async list_barber_customers(
		req: Request,
		res: Response
	): Promise<Response<TUser>> {
		try {
			const barber: IBarberDocument = res.locals.barber;

			if (!barber) {
				throw new HttpException(400, SYSTEM_ERRORS.BARBER_NOT_FOUND);
			}

			await barber.populate({
				path: "customers",
				populate: {
					path: "avatar",
				},
			});

			return res.status(200).json(barber.customers);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new BarbersRepository();
