import { Response } from "express";
import { HttpException } from "../HttpException";
import { SYSTEM_ERRORS } from "..";

function errorHandler(err: any, res: Response): Response {
	if (err instanceof HttpException) {
		console.log(`**ERROR**: [${err.status}] : ${err.message}`);
		return res.status(err.status).json({ message: err.message });
	}

	console.log(`**ERROR**: ${err.message}`);

	const message: string = err.message;
	
	if (message && message.includes("Invalid parameter `To`")) {
		return res
			.status(400)
			.json({ message: SYSTEM_ERRORS.INVALID_PHONE_NUMBER });
	}

	return res.status(400).json({ message: err.message });
}

export { errorHandler };
