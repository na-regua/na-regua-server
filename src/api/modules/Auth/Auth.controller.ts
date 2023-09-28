import { BaseController } from "@core/BaseController";

export class AuthController extends BaseController {
	routePrefix = "/auth";

	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {}
}
