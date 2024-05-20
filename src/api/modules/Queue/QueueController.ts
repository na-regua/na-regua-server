import { BaseController, ENDPOINTS, errorHandler } from "@core/index";
import { AuthRepository } from "../Auth";
import QueueRepository from "./QueueRepository";
import { QueueModel } from "./QueueSchema";

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

		this.router.get(
			ENDPOINTS.QUEUE_BARBER_TODAY,
			AuthRepository.isAuthenticated,
			QueueRepository.getBarberTodayQueue
		);

		this.router.post(
			ENDPOINTS.QUEUE_CREATE,
			AuthRepository.isAuthenticated,
			AuthRepository.workForBarber,
			QueueRepository.create
		);

		this.router.post(
			ENDPOINTS.QUEUE_JOIN_USER,
			AuthRepository.isAuthenticated,
			QueueRepository.userJoinQueue
		);

		this.router.get(ENDPOINTS.QUEUE_LAST_POSITION, async (req, res) => {
			try {
				const queueId = req.params.queueId;

				const position = await QueueModel.findLastPosition(queueId);

				return res.json({ position });
			} catch (error) {
				return errorHandler(error, res);
			}
		});
	}
}

export { QueueController };
