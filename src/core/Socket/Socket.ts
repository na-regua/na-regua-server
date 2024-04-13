import {
	IQueueCustumerDocument,
	IUserDocument,
	QueueCustomerModel,
	QueueModel,
	UsersModel,
	WorkersModel,
} from "@api/modules";
import { Server, Socket } from "socket.io";
import {
	HttpException,
	ISocketEvent,
	ISocketEventType,
	SYSTEM_ERRORS,
	sessionMiddleware,
} from "..";

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

			this.onQueueEvents(socket, user);

			socket.on("disconnect", () => {
				socket.leave(socket.id);
			});
		});
	}

	onQueueEvents(socket: Socket, userAuth: IUserDocument) {
		socket.on("queue/joinWorker", async (data) => {
			const { code } = data;
			const workerId = userAuth.worker?._id.toString();

			const queue = await QueueModel.findOne({ code });

			if (!queue) {
				this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
				return;
			}

			if (queue.status === "off") {
				this.emitSocketEvent({ socket }, "QUEUE_OFF");
				return;
			}

			await queue?.populate("workers");

			if (!queue.workers.some((worker) => worker._id.toString() === workerId)) {
				this.emitSocketEvent({ socket }, "WORKER_NOT_OWNER");
				return;
			}

			const worker = await WorkersModel.findById(workerId).populate("user");

			await socket.join(queue._id.toString());

			// emit queue data to worker
			await queue.populateCustomers();

			socket.emit("queue/queueData", { queue });

			// emit event to user
			this.emitSocketEvent(
				{ room: queue._id.toString() },
				"WORKER_JOINED_QUEUE",
				{
					worker,
				}
			);
		});

		socket.on("queue/joinCustomer", async (data) => {
			const { code, serviceId } = data;

			const queue = await QueueModel.findOne({ code });

			if (!queue) {
				this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
				return;
			}

			if (queue.status === "off") {
				this.emitSocketEvent({ socket }, "QUEUE_OFF");
				return;
			}

			const queueCustomer = await QueueCustomerModel.create({
				queue: queue._id,
				user: userAuth._id,
				service: serviceId,
			});

			if (!queueCustomer) {
				this.emitSocketEvent({ socket }, "QUEUE_CUSTOMER_NOT_CREATED");
				return;
			}

			await queue.updateOne({
				$push: {
					customers: queueCustomer._id,
				},
			});
			await queue.save();

			// Join queue room
			await socket.join(queue._id.toString());
			// Join queueCustomer room
			await socket.join(queueCustomer._id.toString());

			// Emit customerQueue data to user
			socket.emit("queue/queueCustomerData", {
				queueCustomer,
			});
			// Emit queueData to room
			const updatedQueue = await QueueModel.findById(queue._id);
			await updatedQueue?.populateCustomers();
			this.io.to(queue._id.toString()).emit("queue/queueData", {
				queue: updatedQueue,
			});
			this.emitSocketEvent(
				{ room: queue._id.toString() },
				"QUEUE_CUSTOMER_JOINED"
			);
		});

		socket.on("queue/approveCustomer", async (data) => {
			const { code, customerId } = data;

			const queue = await QueueModel.findOne({ code });

			if (!queue) {
				this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
				return;
			}
			// Check if user has worker
			if (!userAuth.worker) {
				this.emitSocketEvent({ socket }, "USER_IS_NOT_WORKER");
				return;
			}
			// Check if worker is working at queue
			const isWorkingAtQueue = queue.hasWorkerOnQueue(
				userAuth.worker._id.toString()
			);

			if (!isWorkingAtQueue) {
				this.emitSocketEvent({ socket }, "WORKER_IS_NOT_IN_QUEUE");
				return;
			}
			// Check if customer is at queue
			await queue.populateCustomers();

			const isOnQueue = queue.hasCustomerOnQueue(customerId);

			if (!isOnQueue) {
				this.emitSocketEvent({ socket }, "QUEUE_CUSTOMER_IS_NOT_IN_QUEUE");
				return;
			}
			// Get lastPosition to approved customer
			const lastPosition = await QueueModel.findLastPositionOfQueueCustomer(
				queue._id
			);

			const queueCustomer = await QueueCustomerModel.findByIdAndUpdate(
				customerId,
				{ approved: true, status: "queue", position: lastPosition + 1 }
			);

			if (!queueCustomer) {
				this.emitSocketEvent({ socket }, "QUEUE_CUSTOMER_NOT_FOUND");
				return;
			}

			// Emit queueData to room
			const updatedQueue = await QueueModel.findOne({ code });

			if (updatedQueue) {
				await updatedQueue.populateCustomers();

				this.io.to(updatedQueue._id.toString()).emit("queue/queueData", {
					queue: updatedQueue,
				});
			}

			// Emit event to user
			const updatedQueueCustomer = await QueueCustomerModel.findById(
				customerId
			);
			this.emitSocketEvent(
				{ room: queueCustomer._id.toString() },
				"QUEUE_CUSTOMER_APPROVED",
				{
					queueCustomer: updatedQueueCustomer,
				}
			);
			this.io.to(queueCustomer._id.toString()).emit("queue/queueCustomerData", {
				queueCustomer: updatedQueueCustomer,
			});
		});

		socket.on("queue/denyCustomer", async (data) => {
			const { code, customerId } = data;

			const queue = await QueueModel.findOne({ code });

			if (!queue) {
				this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
				return;
			}
			// Check if user has worker
			if (!userAuth.worker) {
				this.emitSocketEvent({ socket }, "USER_IS_NOT_WORKER");
				return;
			}
			// Check if worker is working at queue
			const isWorkingAtQueue = queue.hasWorkerOnQueue(
				userAuth.worker._id.toString()
			);

			if (!isWorkingAtQueue) {
				this.emitSocketEvent({ socket }, "WORKER_IS_NOT_IN_QUEUE");
				return;
			}
			// Check if customer is at queue
			await queue.populateCustomers();

			const isOnQueue = queue.hasCustomerOnQueue(customerId);

			if (!isOnQueue) {
				this.emitSocketEvent({ socket }, "QUEUE_CUSTOMER_IS_NOT_IN_QUEUE");
				return;
			}
			// Remove queueCustomer from queue
			await queue.updateOne({
				$pull: {
					customers: customerId,
				},
			});
			await queue.save();

			// Delete queueCustomer
			await QueueCustomerModel.findByIdAndDelete(customerId);

			// // Emit event to user
			this.emitSocketEvent({ room: customerId }, "QUEUE_CUSTOMER_DENIED");

			// Emit updated queueData to room
			const updatedQueue = await QueueModel.findOne({ code });
			if (updatedQueue) {
				await updatedQueue?.populateCustomers();

				this.io.to(updatedQueue._id.toString()).emit("queue/queueData", {
					queue: updatedQueue,
				});
			}
		});

		socket.on("queue/moveCustomerPosition", async (data) => {});

		socket.on("queue/serveCustomer", async (data) => {
			const { code, customerId } = data;

			const queue = await QueueModel.findOne({ code });

			if (!queue) {
				this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
				return;
			}

			if (queue.status === "off") {
				this.emitSocketEvent({ socket }, "QUEUE_OFF");
				return;
			}

			// Check if user has worker
			if (!userAuth.worker) {
				this.emitSocketEvent({ socket }, "USER_IS_NOT_WORKER");
				return;
			}

			// Check if worker is working at queue
			const isWorkingAtQueue = queue.hasWorkerOnQueue(
				userAuth.worker._id.toString()
			);

			if (!isWorkingAtQueue) {
				this.emitSocketEvent({ socket }, "WORKER_IS_NOT_IN_QUEUE");
				return;
			}

			// Check if customer is at queue
			const customerIsOnQueue = queue.hasCustomerOnQueue(customerId);

			if (!customerIsOnQueue) {
				this.emitSocketEvent({ socket }, "QUEUE_CUSTOMER_IS_NOT_IN_QUEUE");
				return;
			}

			// Get customer
			const queueCustomer = await QueueCustomerModel.findById(customerId);

			if (!queueCustomer) {
				this.emitSocketEvent({ socket }, "QUEUE_CUSTOMER_NOT_FOUND");
				return;
			}

			// Update customer status
			await queueCustomer.updateOne({
				status: "served",
				servedAt: new Date(),
				servedBy: userAuth.worker._id,
			});

			await queue.updateOne({
				$pull: {
					customers: customerId,
				},
				$push: {
					servedCustomers: customerId,
				},
			});

			// Update remaining customers position
			const remainingCustomers = await QueueCustomerModel.find({
				queue: queue._id,
				approved: true,
				status: "queue",
				position: { $gt: queueCustomer.position },
			});

			if (remainingCustomers) {
				for (let customer of remainingCustomers) {
					if (customer.position && customer.position > 0) {
						await customer.updateOne({
							position: customer.position - 1,
						});
					}
				}
			}

			// Emit event to room
			const updatedQueue = await QueueModel.findOne({ code });
			if (updatedQueue) {
				await updatedQueue.populateCustomers();
				this.io.to(updatedQueue._id.toString()).emit("queue/queueData", {
					queue: updatedQueue,
				});
				this.emitSocketEvent({ room: customerId }, "QUEUE_CUSTOMER_SERVED");
			}

			// Emit event to user
			const updatedQueueCostumer = await QueueCustomerModel.findById(
				customerId
			);

			if (updatedQueueCostumer) {
				this.io.to(customerId).emit("queue/queueCustomerData", {
					queueCustomer: updatedQueueCostumer,
				});
			}
		});

		socket.on("queue/missedCustomer", async (data) => {});

		socket.on("queue/filters", async (data) => {});

		socket.on("queue/pauseQueue", async (data) => {});

		socket.on("queue/resumeQueue", async (data) => {});

		socket.on("queue/finishQueue", async (data) => {
			const { code } = data;

			const queue = await QueueModel.findOne({ code });

			if (!queue) {
				this.emitSocketEvent({ socket }, "QUEUE_NOT_FOUND");
				return;
			}

			if (queue.status === "off") {
				this.emitSocketEvent({ socket }, "QUEUE_OFF");
				return;
			}

			// Check if user has worker
			if (!userAuth.worker) {
				this.emitSocketEvent({ socket }, "USER_IS_NOT_WORKER");
				return;
			}

			// Check if worker is working at queue
			const isWorkingAtQueue = queue.hasWorkerOnQueue(
				userAuth.worker._id.toString()
			);

			if (!isWorkingAtQueue) {
				this.emitSocketEvent({ socket }, "WORKER_IS_NOT_IN_QUEUE");
				return;
			}

			// Finish queue
			await queue.updateOne({
				status: "off",
			});

			// Set not customers on queue as missed
			const findCustomers = await QueueCustomerModel.find({
				queue: queue._id,
			});

			if (findCustomers) {
				for (let customer of findCustomers) {
					await customer.updateOne({
						status: "missed",
						missedAt: new Date(),
					});
				}
			}

			// Get updated queue
			const updatedQueue = await QueueModel.findOne({ code });

			await updatedQueue?.populateCustomers();

			// Emit event to workers
			socket.emit("queue/queueData", { queue: updatedQueue });

			// TO DO: Generate billing report and send to workers

			// Emit event to room
			this.emitSocketEvent({ room: queue._id.toString() }, "QUEUE_FINISHED");
		});
	}

	emitSocketEvent(
		sender: {
			socket?: Socket;
			room?: string;
		},
		event: ISocketEventType,
		data?: any
	) {
		const eventData: ISocketEvent = {
			event,
			data,
		};

		if (sender.room) {
			this.io.to(sender.room).emit("queue/events", eventData);
		}

		if (!sender.room && sender.socket) {
			sender.socket.emit("queue/events", eventData);
		}
	}
}

export { SocketServer };
