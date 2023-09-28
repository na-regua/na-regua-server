import { SYSTEM_ERRORS } from "@core/SystemErrors/SystemErrors";
import twilio from "twilio";
import { VerificationCheckInstance } from "twilio/lib/rest/verify/v2/service/verificationCheck";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
	process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

class TwilioRepository {
	async sendOTP(phone: string) {
		try {
			if (!TWILIO_SERVICE_SID) {
				throw new Error(SYSTEM_ERRORS.UNAVAILABLE_MESSAGE_SERVICE);
			}

			const OTPResponse = await client.verify.v2
				.services(TWILIO_SERVICE_SID)
				.verifications.create({
					to: `+55 ${phone}`,
					channel: "whatsapp",
				});

			return OTPResponse;
		} catch (error) {
			return error;
		}
	}

	async verifyOTP(
		code: string,
		phone: string
	): Promise<VerificationCheckInstance | Error> {
		try {
			if (!TWILIO_SERVICE_SID) {
				throw new Error(SYSTEM_ERRORS.UNAVAILABLE_MESSAGE_SERVICE);
			}

			const OTPResponse = await client.verify.v2
				.services(TWILIO_SERVICE_SID)
				.verificationChecks.create({
					to: `+55 ${phone}`,
					code,
				});

			return OTPResponse;
		} catch (error: any) {
			return error;
		}
	}
}

export default new TwilioRepository();
