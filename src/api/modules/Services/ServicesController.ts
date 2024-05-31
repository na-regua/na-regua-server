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
			AuthRepository.is_authenticated,
			ServicesRepository.index
		);

		this.router.put(
			ENDPOINTS.SERVICES_UPDATE,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			ServicesRepository.update
		);
		this.router.post(
			ENDPOINTS.SERVICES_CREATE,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			ServicesRepository.create
		);
		this.router.delete(
			ENDPOINTS.SERVICES_DELETE,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			ServicesRepository.delete
		);
	}
}

export default ServicesController;
