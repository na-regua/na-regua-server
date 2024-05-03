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
import { SocketQueueEvents } from "./events";

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

			req.session.user = user;
			req.session.save();

			next();
		});

		// server.listen(443, () => {
		// 	console.log("Socket server is running on port 443");
		// });

		this.onConnection();
	}

	onConnection() {
		this.io.on("connection", (socket: Socket) => {
			const user = (socket.request as any).session.user;

			const queueEvents = new SocketQueueEvents(socket, user);
			queueEvents.init();

			socket.join(user._id.toString());

			socket.on("disconnect", () => {
				socket.leave(user._id.toString());
			});
		});
	}

	// onQueueEvents(socket: Socket, userAuth: IUserDocument) {
	// 	socket.on("queue/joinWorker", async (data) => {
	// 		const { code } = data;
	// 		const workerId = userAuth.worker?._id.toString();

	// 		const queue = await QueueModel.findByCode(code);

	// 		if (!queue) {
	// 			this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
	// 			return;
	// 		}

	// 		if (!queue.workers.some((worker) => worker._id.toString() === workerId)) {
	// 			this.emitSocketEvent({ socket }, "WORKER_NOT_OWNER");
	// 			return;
	// 		}

	// 		const worker = await WorkersModel.findById(workerId).populate("user");

	// 		await socket.join(queue._id.toString());

	// 		socket.emit("queue/queueData", { queue });

	// 		// emit event to user
	// 		this.emitSocketEvent(
	// 			{ room: queue._id.toString() },
	// 			"WORKER_JOINED_QUEUE",
	// 			{
	// 				worker,
	// 			}
	// 		);
	// 	});

	// 	socket.on("queue/joinUser", async (data) => {
	// 		const { code, serviceId } = data;

	// 		const queue = await QueueModel.findByCode(code);

	// 		if (!queue) {
	// 			this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
	// 			return;
	// 		}

	// 		const ticket = await TicketsModel.create({
	// 			queue: queue._id,
	// 			user: userAuth._id,
	// 			service: serviceId,
	// 		});

	// 		if (!ticket) {
	// 			this.emitSocketEvent({ socket }, "TICKET_NOT_CREATED");
	// 			return;
	// 		}

	// 		await queue.updateOne({
	// 			$push: {
	// 				tickets: ticket._id,
	// 			},
	// 		});
	// 		await queue.save();

	// 		// Join queue room
	// 		await socket.join(queue._id.toString());
	// 		// Join ticket room
	// 		await socket.join(ticket._id.toString());

	// 		// Emit customerQueue data to user
	// 		socket.emit("queue/ticketData", {
	// 			ticket,
	// 		});
	// 		// Emit queueData to room
	// 		const updatedQueue = await QueueModel.findById(queue._id);
	// 		await updatedQueue?.populateAll();
	// 		this.io.to(queue._id.toString()).emit("queue/queueData", {
	// 			queue: updatedQueue,
	// 		});
	// 		this.emitSocketEvent({ room: queue._id.toString() }, "USER_JOINED");
	// 	});

	// 	socket.on("queue/approveUser", async (data) => {
	// 		const { code, customerId } = data;

	// 		const queue = await QueueModel.findByCode(code);

	// 		if (!queue) {
	// 			this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
	// 			return;
	// 		}
	// 		// Check if user has worker
	// 		if (!userAuth.worker) {
	// 			this.emitSocketEvent({ socket }, "USER_IS_NOT_WORKER");
	// 			return;
	// 		}
	// 		// Check if worker is working at queue
	// 		const isWorkingAtQueue = queue.hasWorkerOnQueue(
	// 			userAuth.worker._id.toString()
	// 		);

	// 		if (!isWorkingAtQueue) {
	// 			this.emitSocketEvent({ socket }, "WORKER_IS_NOT_IN_QUEUE");
	// 			return;
	// 		}
	// 		// Check if customer is at queue
	// 		await queue.populateAll();

	// 		const isOnQueue = queue.hasTicketOnQueue(customerId);

	// 		if (!isOnQueue) {
	// 			this.emitSocketEvent({ socket }, "TICKET_IS_NOT_IN_QUEUE");
	// 			return;
	// 		}
	// 		// Get lastPosition to approved customer
	// 		const lastPosition = await QueueModel.findLastPositionOfTicket(queue._id);

	// 		const ticketToApprove = await TicketsModel.findByIdAndUpdate(customerId, {
	// 			approved: true,
	// 			status: "queue",
	// 			position: lastPosition + 1,
	// 		});

	// 		if (!ticketToApprove) {
	// 			this.emitSocketEvent({ socket }, "TICKET_NOT_FOUND");
	// 			return;
	// 		}

	// 		// Emit queueData to room
	// 		const updatedQueue = await QueueModel.findOne({ code });

	// 		if (updatedQueue) {
	// 			await updatedQueue.populateAll();

	// 			this.io.to(updatedQueue._id.toString()).emit("queue/queueData", {
	// 				queue: updatedQueue,
	// 			});
	// 		}

	// 		// Emit event to user
	// 		const userTicket = await TicketsModel.findById(customerId);

	// 		if (userTicket) {
	// 			this.emitSocketEvent(
	// 				{ room: userTicket._id.toString() },
	// 				"USER_APPROVED",
	// 				{
	// 					ticket: userTicket,
	// 				}
	// 			);
	// 			this.io.to(userTicket._id.toString()).emit("queue/ticketData", {
	// 				ticket: userTicket,
	// 			});
	// 		}
	// 	});

	// 	socket.on("queue/denyUser", async (data) => {
	// 		const { code, ticketId } = data;

	// 		const queue = await QueueModel.findByCode(code);

	// 		if (!queue) {
	// 			this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
	// 			return;
	// 		}
	// 		// Check if user has worker
	// 		if (!userAuth.worker) {
	// 			this.emitSocketEvent({ socket }, "USER_IS_NOT_WORKER");
	// 			return;
	// 		}
	// 		// Check if worker is working at queue
	// 		const isWorkingAtQueue = queue.hasWorkerOnQueue(
	// 			userAuth.worker._id.toString()
	// 		);

	// 		if (!isWorkingAtQueue) {
	// 			this.emitSocketEvent({ socket }, "WORKER_IS_NOT_IN_QUEUE");
	// 			return;
	// 		}
	// 		// Check if has ticket in queue
	// 		await queue.populateAll();

	// 		const isOnQueue = queue.hasTicketOnQueue(ticketId);

	// 		if (!isOnQueue) {
	// 			return;
	// 		}
	// 		// Remove queueCustomer from queue
	// 		await queue.updateOne({
	// 			$pull: {
	// 				tickets: ticketId,
	// 			},
	// 		});
	// 		await queue.save();

	// 		// Delete ticket
	// 		await TicketsModel.findByIdAndDelete(ticketId);

	// 		// Emit event to user
	// 		this.emitSocketEvent({ room: ticketId }, "USER_DENIED");

	// 		// Emit updated queueData to room
	// 		const updatedQueue = await QueueModel.findByCode(code);
	// 		if (updatedQueue) {
	// 			await updatedQueue?.populateAll();

	// 			this.io.to(updatedQueue._id.toString()).emit("queue/queueData", {
	// 				queue: updatedQueue,
	// 			});
	// 		}
	// 	});

	// 	socket.on("queue/moveTicket", async (data) => {});

	// 	socket.on("queue/serveTicket", async (data) => {
	// 		const { code, ticketId } = data;

	// 		const queue = await QueueModel.findByCode(code);

	// 		if (!queue) {
	// 			this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
	// 			return;
	// 		}

	// 		// Check if user has worker
	// 		if (!userAuth.worker) {
	// 			this.emitSocketEvent({ socket }, "USER_IS_NOT_WORKER");
	// 			return;
	// 		}

	// 		// Check if worker is working at queue
	// 		const isWorkingAtQueue = queue.hasWorkerOnQueue(
	// 			userAuth.worker._id.toString()
	// 		);

	// 		if (!isWorkingAtQueue) {
	// 			this.emitSocketEvent({ socket }, "WORKER_IS_NOT_IN_QUEUE");
	// 			return;
	// 		}

	// 		// Check if customer is at queue
	// 		const ticketOnQueue = queue.hasTicketOnQueue(ticketId);

	// 		if (!ticketOnQueue) {
	// 			return;
	// 		}

	// 		// Get customer
	// 		const ticket = await TicketsModel.findById(ticketId);

	// 		if (!ticket) {
	// 			this.emitSocketEvent({ socket }, "TICKET_NOT_FOUND");
	// 			return;
	// 		}

	// 		// Update customer status
	// 		await ticket.updateOne({
	// 			status: "served",
	// 			servedAt: new Date(),
	// 			servedBy: userAuth.worker._id,
	// 		});

	// 		await queue.updateOne({
	// 			$pull: {
	// 				tickets: ticketId,
	// 			},
	// 			$push: {
	// 				servedTickets: ticketId,
	// 			},
	// 		});

	// 		//  Update remaining customers position
	// 		// const remainingTickets = await TicketsModel.find({
	// 		// 	queue: queue._id,
	// 		// 	approved: true,
	// 		// 	status: "queue",
	// 		// 	position: { $gt: ticket.position },
	// 		// });

	// 		// if (remainingTickets) {
	// 		// 	for (let customer of remainingTickets) {
	// 		// 		if (customer.position && customer.position > 0) {
	// 		// 			await customer.updateOne({
	// 		// 				position: customer.position - 1,
	// 		// 			});
	// 		// 		}
	// 		// 	}
	// 		// }

	// 		// Emit event to queue room
	// 		const updatedQueue = await QueueModel.findOne({ code });
	// 		if (updatedQueue) {
	// 			await updatedQueue.populateAll();
	// 			this.io.to(updatedQueue._id.toString()).emit("queue/queueData", {
	// 				queue: updatedQueue,
	// 			});
	// 			this.emitSocketEvent({ room: ticketId }, "TICKET_SERVED");
	// 		}

	// 		// Emit event to user
	// 		const updatedTicket = await TicketsModel.findById(ticketId);

	// 		if (updatedTicket) {
	// 			this.io.to(ticketId).emit("queue/ticketData", {
	// 				ticket: updatedTicket,
	// 			});
	// 		}
	// 	});

	// 	socket.on("queue/missTicket", async (data) => {});

	// 	socket.on("queue/filters", async (data) => {});

	// 	socket.on("queue/pauseQueue", async (data) => {});

	// 	socket.on("queue/resumeQueue", async (data) => {});

	// 	socket.on("queue/finishQueue", async (data) => {
	// 		const { code } = data;

	// 		const queue = await QueueModel.findByCode(code);

	// 		if (!queue) {
	// 			this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
	// 			return;
	// 		}

	// 		// Check if user has worker
	// 		if (!userAuth.worker) {
	// 			this.emitSocketEvent({ socket }, "USER_IS_NOT_WORKER");
	// 			return;
	// 		}

	// 		// Check if worker is working at queue
	// 		const isWorkingAtQueue = queue.hasWorkerOnQueue(
	// 			userAuth.worker._id.toString()
	// 		);

	// 		if (!isWorkingAtQueue) {
	// 			this.emitSocketEvent({ socket }, "WORKER_IS_NOT_IN_QUEUE");
	// 			return;
	// 		}

	// 		// Finish queue
	// 		await queue.updateOne({
	// 			status: "off",
	// 		});

	// 		// Set not served tickets on queue as missed
	// 		const tickets = await TicketsModel.find({
	// 			queue: queue._id,
	// 		});

	// 		if (tickets) {
	// 			await Promise.all(
	// 				tickets.map((ticket) =>
	// 					ticket.updateOne({
	// 						status: "missed",
	// 						missedAt: new Date(),
	// 					})
	// 				)
	// 			);
	// 		}

	// 		// Get updated queue
	// 		const updatedQueue = await QueueModel.findByCode(code);

	// 		if (updatedQueue) {
	// 			// Emit event to workers
	// 			socket.emit("queue/queueData", { queue: updatedQueue });

	// 			// TODO - Generate billing report and send to workers

	// 			// Emit event to room
	// 			this.emitSocketEvent({ room: queue._id.toString() }, "QUEUE_FINISHED");
	// 		}
	// 	});
	// }

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
