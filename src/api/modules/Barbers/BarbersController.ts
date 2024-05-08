import { cloudinaryStorage } from "@config/multer";
import { BaseController, ENDPOINTS } from "@core/index";
import { AuthRepository } from "../Auth";
import BarbersRepository from "./BarbersRepository";

export class BarbersController extends BaseController {
	constructor() {
		super();
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

		this.router.post(
			ENDPOINTS.BARBERS_SIGN_UP,
			cloudinaryStorage.array("files"),
			BarbersRepository.signUp
		);

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

		this.router.post(
			ENDPOINTS.BARBERS_OPEN,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			BarbersRepository.openBarber
		);

		this.router.post(
			ENDPOINTS.BARBERS_CLOSE,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			BarbersRepository.closeBarber
		);
	}
}
