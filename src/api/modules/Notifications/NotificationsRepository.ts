import {
	HttpException,
	SYSTEM_ERRORS,
	SocketUrls,
	errorHandler,
} from "@core/index";
import { GlobalSocket } from "app";
import { Request, Response } from "express";
import { IUserDocument } from "../Users";
import { WorkersModel } from "../Workers";
import {
	NotificationMessageType,
	NotificationsModel,
} from "./NotificationsSchema";
import { QueueModel } from "../Queue";

class CustomerServicesRepository {
	async index(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const notifications = await NotificationsModel.find({ to: user._id });

			return res.json(notifications);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async markAsViewed(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;
			const { notificationId } = req.params;

			const notification = await NotificationsModel.findOne({
				_id: notificationId,
				to: user._id,
			});

			if (!notification) {
				throw new HttpException(400, SYSTEM_ERRORS.NOTIFICATION_NOT_FOUND);
			}

			await notification.updateOne({ viewed: true });

			return res.status(200).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async markAllAsViewed(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const notifications = await NotificationsModel.find({
				to: user._id,
			});

			if (!notifications) {
				throw new HttpException(400, SYSTEM_ERRORS.NOTIFICATION_NOT_FOUND);
			}

			await NotificationsModel.updateMany({ to: user._id }, { viewed: true });

			return res.status(200).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async notifyBarberWorkers(
		barberId: string,
		message: NotificationMessageType,
		data?: any,
		icon?: string
	) {
		// Notify barber workers
		let workers = await WorkersModel.find({
			barber: barberId,
		});

		if (!workers) {
			return;
		}

		workers.forEach(async (worker) => {
			const notification = await NotificationsModel.create({
				to: worker.user._id.toString(),
				message,
				data,
				icon,
			});

			if (!notification) {
				return;
			}

			// Emit socket
			if (GlobalSocket.io) {
				console.log(
					"Emitting notification to worker",
					worker.user._id.toString()
				);

				GlobalSocket.io
					.to(worker.user._id.toString())
					.emit(SocketUrls.NewNotification, { notification });
			}
		});
	}

	async notifyQueueWorkers(
		queueId: string,
		message: NotificationMessageType,
		data?: any,
		icon?: string
	) {
		// Notify barber workers
		const queue = await QueueModel.findOne({
			_id: queueId,
		});

		if (!queue) {
			return;
		}

		queue.workers.forEach(async (workerId) => {
			const worker = await WorkersModel.findOne({
				_id: workerId,
			});

			if(!worker){
				return;
			}

			const notification = await NotificationsModel.create({
				to: worker.user._id.toString(),
				message,
				data,
				icon,
			});

			if (!notification) {
				return;
			}

			// Emit socket
			if (GlobalSocket.io) {
				console.log(
					"Emitting notification to worker",
					worker.user._id.toString()
				);

				GlobalSocket.io
					.to(worker.user._id.toString())
					.emit(SocketUrls.NewNotification, { notification });
			}
		});
	}
}

export default new CustomerServicesRepository();
