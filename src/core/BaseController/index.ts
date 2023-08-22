import { Router } from "express";

abstract class BaseController {
	router = Router();

	abstract routePrefix: string;

	constructor() {}

	abstract handleRoutes(): void;
}

export { BaseController };