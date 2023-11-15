import {
	AuthController,
	BarbersController,
	FilesController,
	UsersController,
	WorkersController,
} from "@api/modules";
import ServicesController from "@api/modules/Services/ServicesController";
import { Application } from "express";

class Router {
	app!: Application;
	apiPrefix!: string;

	constructor(app: Application, apiPrefix: string) {
		this.app = app;
		this.apiPrefix = apiPrefix;
	}

	initRoutes(): void {
		const barbersController = new BarbersController();
		const servicesController = new ServicesController();
		const usersController = new UsersController();
		const authController = new AuthController();
		const workersController = new WorkersController();
		const filesController = new FilesController();

		this.app.use(`${this.apiPrefix}`, barbersController.router);
		this.app.use(`${this.apiPrefix}`, servicesController.router);
		this.app.use(`${this.apiPrefix}`, usersController.router);
		this.app.use(`${this.apiPrefix}`, authController.router);
		this.app.use(`${this.apiPrefix}`, workersController.router);
		this.app.use(`${this.apiPrefix}`, filesController.router);
	}
}

export { Router };
