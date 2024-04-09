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
				filename: file.filename,
				originalName: file.originalname,
				url: file.path,
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
			const file = req.file as TUploadedFile;

			const workerId = req.params.id;

			const worker = await WorkersModel.findOne({
				_id: workerId,
			});

			if (!worker) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			if (body.phone) {
				body.phoneConfirmed = false;
			}

			const workerUser = await UsersModel.findByIdAndUpdate(worker.user._id);

			if (!workerUser) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			const avatarFile = await FilesModel.findById(workerUser.avatar);

			if (file && avatarFile) {
				// TO DO - Delete old file from storage

				await avatarFile.updateOne({
					filename: file.filename,
					localPath: file.path,
					url: `uploads/${file.filename}`,
				});
			}

			return res.status(201).json(workerUser);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response): Promise<Response<any>> {
		try {
			const workerId = req.params.id;

			const barber: IBarberDocument = res.locals.barber;

			if (!workerId) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			const deletedWorker = await WorkersModel.findByIdAndDelete(workerId);

			if (!deletedWorker) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			const deletedUser = await UsersModel.findByIdAndDelete(
				deletedWorker.user._id
			);

			await barber.updateOne({
				$pull: {
					workers: deletedWorker._id,
				},
			});

			return res.status(200).json({ deletedWorker, deletedUser });
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new WorkersRepository();
