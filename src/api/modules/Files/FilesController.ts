import { cloudinaryStorage } from "@config/multer";
import { BaseController, ENDPOINTS } from "@core/index";
import { AuthRepository } from "../Auth";
import FilesRepository from "./FilesRepository";

export class FilesController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.put(
			ENDPOINTS.FILES_UPDATE_USER_AVATAR,
			cloudinaryStorage.single("file"),
			AuthRepository.is_authenticated,
			FilesRepository.update_user_avatar
		);

		this.router.put(
			ENDPOINTS.FILES_UPDATE_BARBER_AVATAR,
			cloudinaryStorage.single("file"),
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			FilesRepository.update_barber_avatar
		);

		this.router.put(
			ENDPOINTS.FILES_UPDATE_BARBER_THUMB,
			cloudinaryStorage.single("file"),
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			FilesRepository.update_barber_thumb
		);

		this.router.post(
			ENDPOINTS.FILES_UPLOAD_BARBER_THUMBS,
			cloudinaryStorage.array("files", 3),
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			FilesRepository.upload_barber_thumbs
		);

		this.router.delete(
			ENDPOINTS.FILES_DELETE_BARBER_THUMBS,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			FilesRepository.delete_barber_thumb
		);
	}
}
