import { cloudinaryStorage } from "@config/multer";
import { BaseController, ENDPOINTS } from "@core/index";
import { AuthRepository } from "../Auth";
import WorkersRepository from "./WorkersRepository";

export class WorkersController extends BaseController {
	constructor() {
		super();
	}

	defineRoutes(): void {
		this.router.get(
			ENDPOINTS.WORKERS_LIST,
			[],
			AuthRepository.is_authenticated,
			WorkersRepository.index
		);

		this.router.post(
			ENDPOINTS.WORKERS_CREATE,
			cloudinaryStorage.single("file"),
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			WorkersRepository.create
		);

		this.router.put(
			ENDPOINTS.WORKERS_UPDATE,
			cloudinaryStorage.single("file"),
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			WorkersRepository.update
		);

		this.router.delete(
			ENDPOINTS.WORKERS_DELETE,
			AuthRepository.is_authenticated,
			AuthRepository.is_admin,
			WorkersRepository.delete
		);
	}
}
