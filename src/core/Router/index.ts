import {
	AuthController,
	BarbersController,
	UsersController,
} from "@api/modules";
import { Application } from "express";

class Router {
	app!: Application;
	apiPrefix!: string;

	constructor(app: Application, apiPrefix: string) {
		this.app = app;
		this.apiPrefix = apiPrefix;
	}

	initRoutes(): void {
		this.initBarbersRoutes();
		this.initUsersRoutes();
		this.initAuthRoutes();
	}

	initBarbersRoutes(): void {
		const barbersController = new BarbersController();
		this.app.use(`${this.apiPrefix}`, barbersController.router);
	}

	initUsersRoutes(): void {
		const usersController = new UsersController();
		this.app.use(`${this.apiPrefix}`, usersController.router);
	}

	initAuthRoutes(): void {
		const authController = new AuthController();
		this.app.use(`${this.apiPrefix}`, authController.router);
	}
}

export { Router };
