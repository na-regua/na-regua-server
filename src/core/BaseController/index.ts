import { Router } from "express";

abstract class BaseController {
	router = Router();

	abstract routePrefix: string;

	constructor() {}

	abstract defineRoutes(): void;
}

export { BaseController };