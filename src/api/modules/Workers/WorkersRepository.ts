import { cloudinaryDestroy } from "@config/multer";
import { HttpException, SYSTEM_ERRORS, errorHandler } from "@core/index";
import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { IBarberDocument } from "../Barbers";
import { FilesModel, TUploadedFile } from "../Files";
import { IUserDocument, UsersModel } from "../Users";
import { IWorkerDocument, TWorker, WorkersModel } from "./WorkersSchema";

class WorkersRepository {
	async index(req: Request, res: Response): Promise<Response<TWorker[]>> {
		try {
			const query = req.query;

			const filters: FilterQuery<IWorkerDocument> = {};

			if (query.barberId) {
				filters.barber = query.barberId;
			}

			const workers = await WorkersModel.find(filters).populate({
				path: "user",
				populate: {
					path: "avatar",
				},
			});

			return res.status(200).json(workers);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async create(req: Request, res: Response): Promise<Response<any>> {
		try {
			const file = req.file as TUploadedFile;

			if (!file) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			const { admin, ...body } = req.body;

			const barber: IBarberDocument = res.locals.barber;

			const avatarFile = await FilesModel.create({
				original_name: file.originalname,
				filename: file.filename,
				url: file.path,
				mimetype: file.mimetype,
			});

			body.avatar = avatarFile._id;

			body.role = !!admin ? "admin" : "worker";

			const workerUser = await UsersModel.create(body);

			if (!workerUser) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_CREATED);
			}

			res.locals.workerUser = workerUser;

			const worker = await WorkersModel.create({
				user: workerUser._id,
				barber: barber._id,
			});

			if (!worker) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_CREATED);
			}

			await workerUser.updateOne({
				worker: worker._id,
			});

			res.locals.worker = worker;

			await barber.updateOne({
				$push: {
					workers: worker._id,
				},
			});

			return res.status(200).json(worker);
		} catch (error) {
			const workerUser: IUserDocument = res.locals.workerUser;
			const worker: IWorkerDocument = res.locals.worker;

			if (workerUser) {
				workerUser.deleteOne();
			}

			if (worker) {
				worker.deleteOne();
			}

			return errorHandler(error, res);
		}
	}

	async update(req: Request, res: Response): Promise<Response<any>> {
		try {
			const body = req.body;

			if (body.phone) {
				body.verified = false;
			}

			const file = req.file as TUploadedFile;

			const workerId = req.params.id;

			const worker = await WorkersModel.findOne({
				_id: workerId,
			});

			if (!worker) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			const workerUser = await UsersModel.findByIdAndUpdate(worker.user._id);

			if (!workerUser) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			const avatarFile = await FilesModel.findById(workerUser.avatar);

			if (file && avatarFile) {
				await Promise.all([
					cloudinaryDestroy(avatarFile.filename),
					avatarFile.updateOne({
						original_name: file.originalname,
						filename: file.filename,
						url: file.path,
						mimetype: file.mimetype,
					}),
				]);
			}

			const updatedWorkerUser = await UsersModel.findById(worker.user._id);

			return res.status(201).json(updatedWorkerUser);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response): Promise<Response<any>> {
		try {
			const barber = res.locals.barber as IBarberDocument;
			const workerId = req.params.id;

			const barberWorkers = await WorkersModel.find({ barber: barber._id });

			if (!workerId) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			if (!barberWorkers) {
				throw new HttpException(400, SYSTEM_ERRORS.NO_WORKERS_TO_DELETE);
			}

			if (barberWorkers.length === 1) {
				throw new HttpException(
					400,
					SYSTEM_ERRORS.BARBER_SHOULD_HAVE_ONE_WORKER
				);
			}

			const workerToDelete = await WorkersModel.findById(workerId);

			if (!workerToDelete) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			// Proceed to delete

			const userToDelete = await UsersModel.findById(workerToDelete.user._id);

			if (!userToDelete) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			const avatarFile = await FilesModel.findById(userToDelete.avatar);

			if (!avatarFile) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			await workerToDelete.deleteOne();
			await userToDelete.deleteOne();
			await avatarFile.deleteOne();
			await cloudinaryDestroy(avatarFile.filename);

			return res.status(200).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new WorkersRepository();
