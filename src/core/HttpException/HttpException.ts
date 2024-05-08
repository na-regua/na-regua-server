import { SYSTEM_ERRORS, TSystemErrors } from "@core/index";

class HttpException extends Error {
	constructor(public status: number, public message: string) {
		if (SYSTEM_ERRORS[message as keyof TSystemErrors]) {
			message = SYSTEM_ERRORS[message as keyof TSystemErrors];
		}

		super(message);
	}
}

export { HttpException };
