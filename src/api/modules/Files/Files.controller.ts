import { multerUpload } from "@config/multer";
import { BaseController } from "@core/BaseController/BaseController";
import { ENDPOINTS } from "@core/Router";
import { AuthRepository } from "../Auth";
import FilesRepository from "./Files.repository";

export class FilesController extends BaseController {
	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.post(
			ENDPOINTS.FILES_CREATE,
			FilesRepository.uploadFileToStorage
		);

		this.router.put(
			ENDPOINTS.FILES_UPDATE_USER,
			multerUpload.single("file"),
			AuthRepository.isAuthenticated,
			FilesRepository.updateUserAvatar
		);

		this.router.put(
			ENDPOINTS.FILES_UPDATE_BARBER_AVATAR,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			FilesRepository.updateBarberAvatar
		);
	}
}
