import { BaseController, ENDPOINTS } from "@core/index";
import QueueCustomerRepository from "./QueueCustomerRepository";
import { AuthRepository } from "../Auth";

class QueueCustomerController extends BaseController {
	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.QUEUECOSTUMER_LIST, QueueCustomerRepository.index);

		this.router.post(
			ENDPOINTS.QUEUECOSTUMER_CREATE,
			AuthRepository.isAuthenticated,
			QueueCustomerRepository.create
		);
		
		this.router.delete(
			ENDPOINTS.QUEUECOSTUMER_CREATE,
			AuthRepository.isAuthenticated,
			QueueCustomerRepository.delete
		);
	}
}

export { QueueCustomerController };
