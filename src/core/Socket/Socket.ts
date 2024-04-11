import { QueueModel, UsersModel } from "@api/modules";
import { Server, Socket } from "socket.io";
import { HttpException, SYSTEM_ERRORS, sessionMiddleware } from "..";

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
			await user.populate("avatar");
			if (!user) {
				return next(new HttpException(400, SYSTEM_ERRORS.UNAUTHORIZED));
			}
			next();
		});

		// server.listen(443, () => {
		// 	console.log("Socket server is running on port 443");
		// });

		this.onConnection();
	}

	onConnection() {
		this.io.on("connection", (socket: Socket) => {
			// socket.handshake.headers
			console.log(`socket.io connected: ${socket.id}`);

			this.onQueueEvents(socket);

			socket.join(socket.id);
			socket.on("disconnect", () => {
				socket.leave(socket.id);
			});
		});
	}

	onQueueEvents(socket: Socket) {
		socket.on("queue/joinUser", async (data) => {
			console.log("queue/joinUser", data);
			const { code, name } = data;

			const queueData = await QueueModel.findOne({ code }).populate("worker");

			if (!queueData) {
				console.log("Queue not found");

				return;
			}

			await socket.join(code);

			// Emit to itself
			socket.emit("queue/updateData", {
				queueData,
			});

			// Emit to room
			socket.to(code).emit("queue/updateData", {
				queueData,
			});
			socket.to(code).emit("queue/event", {
				message: `${name} joined the queue`,
			});
		});

		socket.on("queue/approveUser", async (data) => {
			console.log("queue/approveUser", data);
			const { code, userId } = data;

			const queueData = await QueueModel.findOne({ code });
			const user = await UsersModel.findById(userId);

			if (!queueData) {
				console.log("Queue not found");

				return;
			}

			if (!user) {
				console.log("User not found");

				return;
			}

			socket.to(code).emit("queue/event", {
				event: "APROVE_USER",
				data: {
					userId,
				},
				message: `User ${user.name} approved`,
			});
		});
	}
}

export { SocketServer };
