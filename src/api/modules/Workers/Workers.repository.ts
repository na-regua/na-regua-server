import { HttpException, SYSTEM_ERRORS, errorHandler } from "@core/index";
import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { IBarberDocument } from "../Barbers";
import { IUserDocument, UsersModel } from "../Users";
import { WorkersModel } from "./Workers.model";
import { IWorkerDocument, TWorker } from "./Workers.schema";

class WorkersRepository {
	async index(req: Request, res: Response): Promise<Response<TWorker[]>> {
		try {
			const query = req.query;

			const filters: FilterQuery<IWorkerDocument> = {};

			if (query.barberId) {
				filters.barber = query.barberId;
			}

			const workers = await WorkersModel.find(filters).populate("user");

			return res.status(200).json(workers);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async create(req: Request, res: Response): Promise<Response<any>> {
		try {
			const body = req.body;
			const file = req.file;

			const barber: IBarberDocument = res.locals.barber;

			if (!file) {
				throw new HttpException(400, SYSTEM_ERRORS.FILE_NOT_FOUND);
			}

			body.avatar = file.buffer;

			const workerUser = await UsersModel.create(body);

			if (!workerUser) {
				throw new HttpException(400, SYSTEM_ERRORS.USER_NOT_FOUND);
			}

			const worker = await WorkersModel.create({
				user: workerUser._id,
				barber: barber._id,
			});

			if (!worker) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_CREATED);
			}

			await barber.updateOne({
				$push: {
					workers: worker._id,
				},
			});

			return res.status(200).json(worker);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async update(req: Request, res: Response): Promise<Response<any>> {
		try {
			const user: IUserDocument = res.locals.user;

			const body = req.body;

			const workerId = req.params.id;

			const worker = await WorkersModel.findOne({
				_id: workerId,
			}).populate("user");

			if (!worker) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			const workerUser = await UsersModel.findById(worker.user._id);

			if (!workerUser) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			await workerUser.updateOne(body);

			return res.status(200).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async delete(req: Request, res: Response): Promise<Response<any>> {
		try {
			const workerId = req.params.id;

			const user: IUserDocument = res.locals.user;
			const barber: IBarberDocument = res.locals.barber;

			if (!workerId) {
				throw new HttpException(400, SYSTEM_ERRORS.WORKER_NOT_FOUND);
			}

			await WorkersModel.deleteOne({
				_id: workerId,
			});
			await user.deleteOne();
			await barber.updateOne({
				$pull: {
					workers: workerId,
				},
			});

			return res.status(200).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}
}

export default new WorkersRepository();
