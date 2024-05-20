import {
	HttpException,
	SYSTEM_ERRORS,
	SocketUrls,
	errorHandler,
} from "@core/index";
import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { GlobalSocket } from "../../../app";
import { QueueModel } from "../Queue";
import { IUserDocument, UsersModel } from "../Users";
import { WorkersModel } from "../Workers";
import {
	INotificationDocument,
	NotificationMessageType,
	NotificationsModel,
	populateNotifications,
} from "./NotificationsSchema";

class CustomerServicesRepository {
	async index(req: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const { read, limit } = req.query;

			const userId = user._id.toString();

			const params: FilterQuery<INotificationDocument> = {
				to: userId,
			};

			if (read) {
				params.read = read === "true";
			}
			// filter notification by barber too, this will reduce the number of notification documents, and improve performance
			// if (user.role === "admin" || "worker") {
			// 	const worker = await WorkersModel.findOne({
			// 		user: user._id,
			// 	});

			// 	if (worker) {
			// 		const workerBarberId = worker.barber._id.toString();

			// 		params.to = {
			// 			$in: [userId, workerBarberId],
			// 		};
			// 	}
			// }

			const total = await NotificationsModel.countDocuments(params);

			const hasUnread = !!(await NotificationsModel.exists({
				to: user._id.toString(),
				read: false,
			}));

			const notifications = await NotificationsModel.find(params)
				.sort({ createdAt: -1 })
				.limit(limit ? +limit : 0);

			if (!notifications) {
				return res.status(200).json([]);
			}

			await populateNotifications(notifications);

			return res.status(200).json({ notifications, total, hasUnread });
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

			await notification.updateOne({ read: true });

			return res.status(200).json(null);
		} catch (error) {
			return errorHandler(error, res);
		}
	}

	async markAllAsViewed(_: Request, res: Response) {
		try {
			const user: IUserDocument = res.locals.user;

			const notifications = await NotificationsModel.find({
				to: user._id,
			});

			if (!notifications) {
				throw new HttpException(400, SYSTEM_ERRORS.NOTIFICATION_NOT_FOUND);
			}

			await NotificationsModel.updateMany({ to: user._id }, { read: true });

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

			if (!worker) {
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

	async notifyUser(
		userId: string,
		message: NotificationMessageType,
		data?: any,
		icon?: string
	) {
		// Notify barber workers
		const user = await UsersModel.findById(userId);
		if (!user) {
			return;
		}

		const notification = await NotificationsModel.create({
			to: user._id.toString(),
			message,
			data,
			icon,
		});

		if (!notification) {
			return;
		}

		await populateNotifications([notification]);

		if (GlobalSocket.io) {
			GlobalSocket.io
				.to(user._id.toString())
				.emit(SocketUrls.NewNotification, { notification });
		}
	}
}

export default new CustomerServicesRepository();
