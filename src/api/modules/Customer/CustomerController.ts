import { BaseController, ENDPOINTS } from "@core/index";
import CustomerRepository from "./CustomerRepository";
import { AuthRepository } from "../Auth";

class CustomerController extends BaseController {
	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.CUSTOMER_LIST, CustomerRepository.index);

		this.router.post(
			ENDPOINTS.CUSTOMER_CREATE,
			AuthRepository.isAuthenticated,
			CustomerRepository.create
		);
	}
}

export { CustomerController };
