import { Router } from "express";

abstract class BaseController {
	router = Router();

	constructor() {}

	abstract defineRoutes(): void;
}

export { BaseController };
