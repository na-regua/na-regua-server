import { BaseController } from "@core/BaseController/BaseController";
import ServicesRepository from "./ServicesRepository";
import { AuthRepository } from "../Auth";
import { ENDPOINTS } from "@core/Router";

class ServicesController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(
			ENDPOINTS.SERVICES_LIST,
			AuthRepository.isAuthenticated,
			ServicesRepository.index
		);

		this.router.put(
			ENDPOINTS.SERVICES_UPDATE,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			ServicesRepository.update
		);
		this.router.post(
			ENDPOINTS.SERVICES_CREATE,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			ServicesRepository.create
		);
		this.router.delete(
			ENDPOINTS.SERVICES_DELETE,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			ServicesRepository.delete
		);
	}
}

export default ServicesController;
