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
			const isHandshake = req._query.sid === undefined;
			if (!isHandshake) {
				return next();
			}
			let token = req.headers.authorization;
			if (!token) {
				return next(new HttpException(403, SYSTEM_ERRORS.TOKEN_NOT_FOUND));
			}
			token = token.replace("Bearer", "").trim();
			const user = await UsersModel.findByToken(token);

			if (user instanceof HttpException) {
				throw user;
			}

			await user.populate("avatar");
			if (!user) {
				return next(new HttpException(400, SYSTEM_ERRORS.UNAUTHORIZED));
			}

			req.session.user = user;
			req.session.save();

			next();
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
