import { BaseController, ENDPOINTS } from "@core/index";
import AuthRepository from "./AuthRepository";

export class AuthController extends BaseController {
	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.post(ENDPOINTS.AUTH_LOGIN_EMAIL, AuthRepository.loginWithEmail);

		this.router.post(
			ENDPOINTS.AUTH_VERIFY_CODE,
			AuthRepository.verifyOTPCode
		);

		this.router.post(
			ENDPOINTS.AUTH_SEND_CODE,
			AuthRepository.sendOTPCode
		);

		this.router.get(
			ENDPOINTS.AUTH_GET_CURRENT_USER,
			AuthRepository.isAuthenticated,
			AuthRepository.getCurrentUser
		);
	}
}
