import {
	AuthController,
	BarbersController,
	FilesController,
	NotificationController,
	QueueController,
	QueueTicketsController,
	TicketsController,
	UsersController,
	WorkersController,
} from "@api/modules";
import { SchedulesController } from "@api/modules/Schedules";
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
		const controllers = [
			new BarbersController(),
			new ServicesController(),
			new UsersController(),
			new AuthController(),
			new WorkersController(),
			new FilesController(),
			new QueueController(),
			new TicketsController(),
			new NotificationController(),
			new QueueTicketsController(),
			new SchedulesController(),
		];

		controllers.map((controller) =>
			this.app.use(this.apiPrefix, controller.router)
		);
	}
}

export { Router };
