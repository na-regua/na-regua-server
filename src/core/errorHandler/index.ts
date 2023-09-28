import { Response } from "express";
import { HttpException } from "../HttpException";

function errorHandler(err: any, res: Response): Response {
	if (err instanceof HttpException) {
		return res.status(err.status).json({ message: err.message });
	}

	return res.status(400).json({ message: err.message });
}

export { errorHandler };
