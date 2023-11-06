import { BaseController } from "@core/BaseController";
import BarbersRepository from "./Barbers.repository";
import { multerUpload } from "@config/multer";
import { AuthRepository } from "../Auth";
import { ENDPOINTS } from "@core/Router";

export class BarbersController extends BaseController {
	routePrefix = "/barbers";

	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.BARBERS_LIST, BarbersRepository.index);

		this.router.get(
			ENDPOINTS.BARBERS_BY_TOKEN,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			BarbersRepository.show
		);

		this.router.put(
			ENDPOINTS.BARBERS_UPDATE,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			BarbersRepository.update
		);

		this.router.post(ENDPOINTS.BARBERS_SIGN_UP, BarbersRepository.signUp);

		this.router.delete(
			ENDPOINTS.BARBERS_DELETE,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			BarbersRepository.delete
		);

		this.router.post(
			ENDPOINTS.BARBERS_COMPLETE_PROFILE,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			BarbersRepository.completeProfile
		);
	}
}
