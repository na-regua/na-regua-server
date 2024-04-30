import { BaseController, ENDPOINTS } from "@core/index";
import QueueRepository from "./QueueRepository";

class QueueController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.QUEUE_LIST, QueueRepository.index);
		this.router.post(ENDPOINTS.QUEUE_CREATE, QueueRepository.create);
	}
}

export { QueueController };
