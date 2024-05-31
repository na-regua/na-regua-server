import { cloudinaryStorage } from "@config/multer";
import { BaseController } from "@core/BaseController/BaseController";
import { ENDPOINTS } from "@core/Router";
import { AuthRepository } from "../Auth";
import UsersRepository from "./UsersRepository";

export class UsersController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(ENDPOINTS.USERS_LIST, UsersRepository.list);
		this.router.get(
			ENDPOINTS.USERS_LIST_FAVORITES,
			AuthRepository.is_authenticated,
			UsersRepository.listFavorites
		);

		this.router.post(
			ENDPOINTS.USERS_CREATE,
			cloudinaryStorage.single("file"),
			UsersRepository.create
		);

		this.router.put(
			ENDPOINTS.USERS_UPDATE,
			AuthRepository.is_authenticated,
			UsersRepository.update
		);

		this.router.post(
			ENDPOINTS.USERS_SEND_WHATSAPP_CODE,
			UsersRepository.sendWhatsappCode
		);
		this.router.post(
			ENDPOINTS.USERS_VERIFY_WHATSAPP_CODE,
			UsersRepository.verifySms
		);

		this.router.put(
			ENDPOINTS.USERS_FAVORITE_BARBER,
			AuthRepository.is_authenticated,
			UsersRepository.favoriteBarber
		);

		this.router.delete(ENDPOINTS.USERS_DELETE, UsersRepository.delete);
	}
}
