import {
	AuthController,
	BarbersController,
	UsersController,
	WorkersController,
} from "@api/modules";
import ServicesController from "@api/modules/Services/Services.controller";
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
		this.initServicesRoutes();
		this.initWorkersRoutes();
	}

	initBarbersRoutes(): void {
		const barbersController = new BarbersController();
		this.app.use(`${this.apiPrefix}`, barbersController.router);
	}

	initUsersRoutes(): void {
		const usersController = new UsersController();
		this.app.use(`${this.apiPrefix}`, usersController.router);
	}

	initServicesRoutes(): void {
		const servicesController = new ServicesController();
		this.app.use(`${this.apiPrefix}`, servicesController.router);
	}

	initAuthRoutes(): void {
		const authController = new AuthController();
		this.app.use(`${this.apiPrefix}`, authController.router);
	}

	initWorkersRoutes(): void {
		const workersController = new WorkersController();
		this.app.use(`${this.apiPrefix}`, workersController.router);
	}
}

export { Router };
