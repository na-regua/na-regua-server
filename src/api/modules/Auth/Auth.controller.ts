import { BaseController } from "@core/BaseController";
import AuthRepository from "./Auth.repository";

export class AuthController extends BaseController {
	routePrefix = "/auth";

	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.post(
			`${this.routePrefix}/login/email`,
			AuthRepository.loginWithEmail
		);

		this.router.post(
			`${this.routePrefix}/login/phone`,
			AuthRepository.loginWithPhone
		);

		this.router.post(
			`${this.routePrefix}/verify/whatsapp-code`,
			AuthRepository.verifyPhone
		);

		this.router.post(
			`${this.routePrefix}/send/whatsapp-code`,
			AuthRepository.sendWhatsappCode
		);

		this.router.get(
			`${this.routePrefix}/me`,
			AuthRepository.isAuthenticated,
			AuthRepository.getCurrentUser
		);
	}
}
