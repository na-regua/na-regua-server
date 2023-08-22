import { BaseController } from "@core/BaseController";
import barbersRepository from "./barbers.repository";

export class BarbersController extends BaseController {
	routePrefix = "/barbers";

	constructor() {
		super();

		this.handleRoutes();
	}

	handleRoutes(): void {
		this.router.get(this.routePrefix, barbersRepository.index);
	}
}
