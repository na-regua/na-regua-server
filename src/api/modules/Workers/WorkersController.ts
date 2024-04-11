import { BaseController } from "@core/index";
import { AuthRepository } from "../Auth";
import WorkersRepository from "./WorkersRepository";
import { cloudinaryStorage } from "@config/multer";
import { ENDPOINTS } from "@core/Router";

export class WorkersController extends BaseController {
	constructor() {
		super();

		this.defineRoutes();
	}

	defineRoutes(): void {
		this.router.get(
			ENDPOINTS.WORKERS_LIST,
			[],
			AuthRepository.isAuthenticated,
			WorkersRepository.index
		);

		this.router.post(
			ENDPOINTS.WORKERS_CREATE,
			cloudinaryStorage.single("file"),
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			WorkersRepository.create
		);

		this.router.put(
			ENDPOINTS.WORKERS_UPDATE,
			cloudinaryStorage.single("file"),
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			WorkersRepository.update
		);

		this.router.delete(
			ENDPOINTS.WORKERS_DELETE,
			AuthRepository.isAuthenticated,
			AuthRepository.isAdmin,
			WorkersRepository.delete
		);
	}
}
