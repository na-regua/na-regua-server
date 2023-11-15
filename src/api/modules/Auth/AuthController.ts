import { BaseController } from "@core/BaseController/BaseController";
import { ENDPOINTS } from "@core/Router";
import AuthRepository from "./AuthRepository";

export class AuthController extends BaseController {
	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.post(ENDPOINTS.AUTH_LOGIN_EMAIL, AuthRepository.loginWithEmail);

		this.router.post(
			ENDPOINTS.AUTH_VERIFY_WHATSAPP,
			AuthRepository.verifyWhatsappCode
		);

		this.router.post(
			ENDPOINTS.AUTH_SEND_WHATSAPP_CODE,
			AuthRepository.sendWhatsappCode
		);

		this.router.get(
			ENDPOINTS.AUTH_GET_CURRENT_USER,
			AuthRepository.isAuthenticated,
			AuthRepository.getCurrentUser
		);
	}
}
