import * as handlebars from "handlebars";
import * as fs from "fs";

const readHTMLFile = async (
	path: string
): Promise<NodeJS.ErrnoException | string> => {
	return await new Promise((resolve, reject) => {
		fs.readFile(path, { encoding: "utf-8" }, (err, html) => {
			if (err) {
				reject(err);
			} else {
				resolve(html);
			}
		});
	});
};

export function generateAuthCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


export async function generateCodeTemplate(
	username: string,
	code: string
): Promise<string> {
	let htmlStr = "";

	const html = await readHTMLFile(__dirname + "/templates/code.html");

	if(html instanceof Error) {
		throw html;
	}

	const template = handlebars.compile(html);
	htmlStr = template({ username, code });

	return htmlStr;
}
