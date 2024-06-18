import { UsersModel } from "@api/modules";
import { Server, Socket } from "socket.io";
import {
	HttpException,
	ISocketEvent,
	ISocketEventType,
	SYSTEM_ERRORS,
	SocketUrls,
	sessionMiddleware,
} from "..";
import { QueueSocketEvents } from "./events";

class SocketServer {
	app!: any;
	io!: Server;

	constructor(app: any) {
		this.app = app;
	}

	start(): void {
		// const server = createServer(this.app);
		this.io = new Server(this.app, {
			cors: {
				origin: "*",
			},
		});

		this.io.engine.use(sessionMiddleware);
		this.io.engine.use(async (req: any, res: any, next: any) => {
			try {
				const isHandshake = req._query.sid === undefined;

				if (!isHandshake) {
					return next();
				}
				let token = req.headers.authorization;

				token = token.replace("Bearer", "").trim();
				const user = await UsersModel.findByToken(token);

				await user.populate("avatar");

				req.session.user = user;
				req.session.save();

				next();
			} catch (error) {
				throw new HttpException(400, SYSTEM_ERRORS.UNAUTHORIZED);
			}
		});

		this.onConnection();
	}

	onConnection() {
		this.io.on("connection", (socket: Socket) => {
			const user = (socket.request as any).session.user;

			const queueEvents = new QueueSocketEvents(socket, user);
			queueEvents.init();

			socket.join(user._id.toString());

			socket.on("disconnect", () => {
				socket.leave(user._id.toString());
			});
		});
	}

	emitEvent(socket: Socket, event: ISocketEventType, data?: any): void {
		const eventData: ISocketEvent = {
			event,
			data,
		};

		socket.emit(SocketUrls.Event, eventData);
	}

	emitGlobalEvent(room: string, event: ISocketEventType, data?: any): void {
		const eventData: ISocketEvent = {
			event,
			data,
		};

		this.io.to(room).emit(SocketUrls.Event, eventData);
	}
}

export { SocketServer };
