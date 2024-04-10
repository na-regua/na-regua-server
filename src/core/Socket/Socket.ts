import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { SocketQueueEvent } from "./Socket.model";
import { QueueModel, UsersModel } from "@api/modules";
import { sessionMiddleware } from "..";

class SocketServer {
	app!: Express.Application;
	io!: Server;

	constructor(app: Express.Application) {
		this.app = app;
	}

	start(): void {
		const server = createServer(this.app);
		this.io = new Server(server, {
			cors: {
				origin: "*",
			},
		});
		this.io.engine.use(sessionMiddleware);

		server.listen(443, () => {
			console.log("Socket server is running on port 443");
		});

		this.onConnection();
	}

	onConnection() {
		this.io.on("connection", (socket: any) => {
			// socket.handshake.headers
			console.log(`socket.io connected: ${socket.id}`);

			if (socket.request.session) {
				socket.request.session.socketio = socket.id;
				socket.request.session.save();
			}

			this.onQueueEvents(socket);

			socket.on("disconnect", () => {
				console.log("User disconnected");
			});
		});
	}

	onQueueEvents(socket: Socket) {
		socket.on("queue/create", () => {
			console.log("Queue created");
		});

		socket.on("queue/joinUser", async (msg) => {
			const { code, userId } = msg;

			const queueData = await QueueModel.findOne({ code });

			const user = await UsersModel.findById(userId);

			socket.emit("queue/updateData", {
				queueData,
				user,
			});
		});
	}
}

export { SocketServer };
