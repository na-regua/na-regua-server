import { TOKEN_SECRET } from "@api/modules";
import { sign, verify } from "jsonwebtoken";

export const decodeToken = (token: string): string | null => {
	try {
		const decoded = verify(token, TOKEN_SECRET);

		return decoded as string;
	} catch (error) {
		return null;
	}
};

export const encodeToken = (data: string): string => {
	return sign(data, TOKEN_SECRET);
};
