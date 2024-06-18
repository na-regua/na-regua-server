import { BaseController, ENDPOINTS } from "@core/index";
import { AuthRepository } from "../Auth";
import QueueRepository from "./QueueRepository";

class QueueController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.QUEUE_LIST, QueueRepository.index);
		this.router.get(
			ENDPOINTS.QUEUE_BARBER_TODAY,
			AuthRepository.is_authenticated,
			AuthRepository.is_barber_worker,
			QueueRepository.get_today_queue
		);

		this.router.get(
			ENDPOINTS.QUEUE_BARBER_TODAY_BY_ID,
			AuthRepository.is_authenticated,
			QueueRepository.get_today_queue_by_barber_id
		);

		this.router.post(
			ENDPOINTS.QUEUE_CREATE,
			AuthRepository.is_authenticated,
			AuthRepository.is_barber_worker,
			QueueRepository.create
		);

		this.router.post(
			ENDPOINTS.QUEUE_USER_JOIN,
			AuthRepository.is_authenticated,
			QueueRepository.user_join_queue
		);

		this.router.post(
			ENDPOINTS.QUEUE_WORKER_JOIN,
			AuthRepository.is_authenticated,
			AuthRepository.is_barber_worker,
			QueueRepository.worker_join_queue
		);

		this.router.put(
			ENDPOINTS.QUEUE_WORKER_APPROVE_TICKET,
			AuthRepository.is_authenticated,
			AuthRepository.is_barber_worker,
			QueueRepository.worker_approve_ticket
		);

		this.router.put(
			ENDPOINTS.QUEUE_WORKER_REJECT_TICKET,
			AuthRepository.is_authenticated,
			AuthRepository.is_barber_worker,
			QueueRepository.worker_reject_ticket
		);

		this.router.post(
			ENDPOINTS.QUEUE_USER_LEAVE,
			AuthRepository.is_authenticated,
			QueueRepository.user_leave_queue
		);

		this.router.put(
			ENDPOINTS.QUEUE_WORKER_GO_NEXT,
			AuthRepository.is_authenticated,
			AuthRepository.is_barber_worker,
			QueueRepository.worker_go_next_ticket
		);

		this.router.post(
			ENDPOINTS.QUEUE_WORKER_FINISH_QUEUE,
			AuthRepository.is_authenticated,
			AuthRepository.is_barber_worker,
			QueueRepository.worker_finish_queue
		);

		this.router.put(
			ENDPOINTS.QUEUE_WORKER_MISS_TICKET,
			AuthRepository.is_authenticated,
			AuthRepository.is_barber_worker,
			QueueRepository.worker_miss_ticket
		);
	}
}

export { QueueController };
