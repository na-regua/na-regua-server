import { cloudinaryStorage } from "@config/multer";
import { BaseController, ENDPOINTS } from "@core/index";
import { AuthRepository } from "../Auth";
import BarbersRepository from "./BarbersRepository";

export class BarbersController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.BARBERS_LIST, BarbersRepository.list);
		this.router.get(
			ENDPOINTS.BARBERS_CUSTOMERS,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			BarbersRepository.list_barber_customers
		);

		this.router.get(
			ENDPOINTS.BARBERS_BY_TOKEN,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			BarbersRepository.find_by_token
		);

		this.router.put(
			ENDPOINTS.BARBERS_UPDATE,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			BarbersRepository.update
		);

		this.router.post(
			ENDPOINTS.BARBERS_SIGN_UP,
			cloudinaryStorage.array("files"),
			BarbersRepository.create
		);

		this.router.delete(
			ENDPOINTS.BARBERS_DELETE,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			BarbersRepository.delete
		);

		this.router.post(
			ENDPOINTS.BARBERS_COMPLETE_PROFILE,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			BarbersRepository.complete_profile
		);

		this.router.put(
			ENDPOINTS.BARBERS_OPEN,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			BarbersRepository.set_is_open
		);
	}
}
