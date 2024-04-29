import { Response, Request } from "express";
import { NotificationsModel } from "./NotificationsSchema";
import { HttpException, SYSTEM_ERRORS, errorHandler } from "@core/index";
import { IUserDocument } from "../Users";

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
}

export default new CustomerServicesRepository();
