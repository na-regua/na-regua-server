import { BaseController } from "@core/BaseController";
import ServicesRepository from "./Services.repository";
import { AuthRepository } from "../Auth";

class ServicesController extends BaseController {
	routePrefix = "/services";

	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(
			this.routePrefix,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			ServicesRepository.index
		);

		this.router.put(
			`${this.routePrefix}/:id`,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			ServicesRepository.update
		);
		this.router.post(
			this.routePrefix,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			ServicesRepository.create
		);
		this.router.delete(
			`${this.routePrefix}/:id`,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			ServicesRepository.delete
		);
	}
}

export default ServicesController;
