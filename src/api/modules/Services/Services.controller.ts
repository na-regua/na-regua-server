import { BaseController } from "@core/BaseController";
import ServicesRepository from "./Services.repository";

class ServicesController extends BaseController {
	routePrefix = "/barbers/services";

	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(this.routePrefix, ServicesRepository.index);
		this.router.put(`${this.routePrefix}/:id`, ServicesRepository.update);
		this.router.post(this.routePrefix, ServicesRepository.create);
	}
}

export default ServicesController;
