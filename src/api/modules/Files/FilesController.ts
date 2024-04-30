import { cloudinaryStorage, multerUpload } from "@config/multer";
import { BaseController } from "@core/BaseController/BaseController";
import { ENDPOINTS } from "@core/Router";
import { AuthRepository } from "../Auth";
import FilesRepository from "./FilesRepository";

export class FilesController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.post(
			ENDPOINTS.FILES_CREATE,
			FilesRepository.uploadFileToStorage
		);

		this.router.put(
			ENDPOINTS.FILES_UPDATE_USER,
			cloudinaryStorage.single("file"),
			AuthRepository.isAuthenticated,
			FilesRepository.updateUserAvatar
		);

		this.router.put(
			ENDPOINTS.FILES_UPDATE_BARBER_AVATAR,
			cloudinaryStorage.single("file"),
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			FilesRepository.updateBarberAvatar
		);

		this.router.put(
			ENDPOINTS.FILES_UPDATE_BARBER_THUMB,
			cloudinaryStorage.single("file"),
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			FilesRepository.updateBarberThumb
		);

		this.router.post(
			ENDPOINTS.FILES_UPLOAD_BARBER_THUMBS,
			cloudinaryStorage.array("files", 3),
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			FilesRepository.uploadBarberThumbs
		);

		this.router.delete(
			ENDPOINTS.FILES_DELETE_BARBER_THUMBS,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			FilesRepository.deleteBarberThumb
		);
	}
}
