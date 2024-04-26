import { HttpException } from "@core/HttpException/HttpException";
import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import twilio from "twilio";
import { VerificationInstance } from "twilio/lib/rest/verify/v2/service/verification";
import { VerificationCheckInstance } from "twilio/lib/rest/verify/v2/service/verificationCheck";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
	process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

class TwilioRepository {
	async sendOTP(phone: number): Promise<VerificationInstance> {
		try {
			if (!TWILIO_SERVICE_SID) {
				throw new HttpException(400, SYSTEM_ERRORS.UNAVAILABLE_MESSAGE_SERVICE);
			}

			const OTPResponse = await client.verify.v2
				.services(TWILIO_SERVICE_SID)
				.verifications.create({
					to: `+55 ${phone}`,
					channel: "whatsapp",
				});

			return OTPResponse;
		} catch (error: any) {
			throw error;
		}
	}

	async verifyOTP(
		code: string,
		phone: number
	): Promise<VerificationCheckInstance> {
		try {
			if (!TWILIO_SERVICE_SID) {
				throw new HttpException(400, SYSTEM_ERRORS.UNAVAILABLE_MESSAGE_SERVICE);
			}

			const OTPResponse = await client.verify.v2
				.services(TWILIO_SERVICE_SID)
				.verificationChecks.create({
					to: `+55 ${phone}`,
					code,
				});

			return OTPResponse;
		} catch (error: any) {
			throw error;
		}
	}
}

export default new TwilioRepository();
