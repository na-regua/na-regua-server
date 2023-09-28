import { BaseController } from "@core/BaseController";
import UsersRepository from "./Users.repository";

export class UsersController extends BaseController {
	routePrefix = "/users";

	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(this.routePrefix, UsersRepository.index);

		this.router.post(
			`${this.routePrefix}/verify-sms`,
			UsersRepository.verifySms
		);
		this.router.delete(`${this.routePrefix}/:id`, UsersRepository.delete);
	}
}
