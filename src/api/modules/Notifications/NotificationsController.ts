import { BaseController, ENDPOINTS } from "@core/index";
import { AuthRepository } from "../Auth";
import NotificationsRepository from "./NotificationsRepository";

class NotificationController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(
			ENDPOINTS.NOTIFICATION_LIST_BY_USER,
			AuthRepository.is_authenticated,
			NotificationsRepository.index
		);

		this.router.put(
			ENDPOINTS.NOTIFICATION_MARK_ALL_AS_VIEWED,
			AuthRepository.is_authenticated,
			NotificationsRepository.mark_all_as_viewed
		);

		this.router.put(
			ENDPOINTS.NOTIFICATION_MARK_AS_VIEWED,
			AuthRepository.is_authenticated,
			NotificationsRepository.mark_as_viewed
		);
	}
}

export { NotificationController };
