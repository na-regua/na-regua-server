import { BaseController, ENDPOINTS } from "@core/index";
import QueueRepository from "./QueueRepository";
import { AuthRepository } from "../Auth";

class QueueController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.QUEUE_LIST, QueueRepository.index);
		this.router.get(
			ENDPOINTS.QUEUE_GET_TODAY,
			AuthRepository.isAuthenticated,
			AuthRepository.workForBarber,
			QueueRepository.getTodayQueue
		);
		this.router.post(
			ENDPOINTS.QUEUE_CREATE,
			AuthRepository.isAuthenticated,
			AuthRepository.workForBarber,
			QueueRepository.create
		);
	}
}

export { QueueController };
