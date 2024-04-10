import connection from "@config/connection/connection";
import { json } from "body-parser";
import cors from "cors";
import express, { Application } from "express";
import { Router } from "../Router/Router";
import { sessionMiddleware } from "../sessionMiddleware/sessionMiddleware";

class Server {
	app!: Application;
	apiPrefix = process.env.API_PREFIX || "/api";

	constructor() {
		this.app = express();
		this.connectDB();

		this.middlewares();
		this.initAPIRoutes();
	}

	private initAPIRoutes(): void {
		const appRouter = new Router(this.app, this.apiPrefix);
		appRouter.initRoutes();
	}

	private middlewares(): void {
		this.app.use(json());
		this.app.use(cors());
		this.app.use(sessionMiddleware);
		// TO DO - static folder in future
		// this.app.use(express.static(path.join(__dirname, "../../public")));
	}

	private async connectDB(): Promise<any> {
		try {
			await connection.then(() => {
				console.log("Database is connected");
			});
		} catch (error: any) {
			console.error(error);
		}
	}

	listen(port: string | number): void {
		this.app.listen(port, () => {
			console.log(`Server is running on port ${port}`);
		});
	}
}

export { Server };
