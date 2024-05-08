import { Router } from "express";

abstract class BaseController {
	router = Router();

	constructor() {
		this.defineRoutes();
	}

	abstract defineRoutes(): void;
}

export { BaseController };
