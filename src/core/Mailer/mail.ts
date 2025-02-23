import { MailerSend, Sender, Recipient, EmailParams } from "mailersend";
import { APIResponse } from "mailersend/lib/services/request.service";

export const MailApi = new MailerSend({
	apiKey: process.env.MAILER_API_KEY || "",
});

export const MailApiDomain = new Sender(
	"MS_Af5o6n@trial-0p7kx4x06e749yjr.mlsender.net",
	"Na Régua"
);

export async function sendMail(
	to: Recipient[],
	subject: string,
	text?: string,
	html?: string
): Promise<APIResponse> {
	const emailParams = new EmailParams()
		.setFrom(MailApiDomain)
		.setTo(to)
		.setSubject(subject)
		.setHtml(html || "")
		.setText(text || "");

	return await MailApi.email.send(emailParams);
}
