import { BaseController, ENDPOINTS } from "@core/index";
import QueueRepository from "./QueueRepository";

class QueueController extends BaseController {
	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.post(ENDPOINTS.QUEUE_CREATE, QueueRepository.create);
	}
}

export { QueueController };
