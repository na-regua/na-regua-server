import { BaseController, ENDPOINTS } from "@core/index";
import AuthRepository from "./AuthRepository";

export class AuthController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.post(
			ENDPOINTS.AUTH_LOGIN_EMAIL,
			AuthRepository.login_with_email
		);

		this.router.post(
			ENDPOINTS.AUTH_VERIFY_CODE,
			AuthRepository.verify_otp_code
		);

		this.router.post(ENDPOINTS.AUTH_SEND_CODE, AuthRepository.send_otp_code);

		this.router.get(
			ENDPOINTS.AUTH_GET_CURRENT_USER,
			AuthRepository.is_authenticated,
			AuthRepository.get_current_user
		);
	}
}
