import {
	BarbersModel,
	IQueueDocument,
	IUserDocument,
	IWorkerDocument,
	NotificationMessageType,
	QueueModel,
	ServicesModel,
	TicketsModel,
	WorkersModel,
} from "@api/modules";
import NotificationsRepository from "@api/modules/Notifications/NotificationsRepository";
import { GlobalSocket } from "app";
import { Socket } from "socket.io";
import { SocketUrls } from "../SocketModel";

export class SocketQueueEvents {
	socket!: Socket;
	user!: IUserDocument;

	filters: {
		showAllTickets: boolean;
	} = {
		showAllTickets: false,
	};

	globalIo = GlobalSocket;

	constructor(socket: Socket, user: IUserDocument) {
		this.socket = socket;
		this.user = user;
	}

	async getQueueDataByUserWorker(): Promise<{
		queue: IQueueDocument;
		worker: IWorkerDocument;
	} | null> {
		const workerId = this.user.worker?._id.toString();

		const worker = await WorkersModel.findById(workerId);

		if (!worker) {
			this.globalIo.emitEvent(this.socket, "WORKER_NOT_FOUND");
			return null;
		}

		const queue = await QueueModel.findBarberTodayQueue(
			worker.barber._id.toString()
		);

		if (!queue) {
			this.globalIo.emitEvent(this.socket, "QUEUE_NOT_FOUND");

			return null;
		}

		return { queue, worker };
	}

	init(): void {
		this.socket.on(SocketUrls.WorkerJoinQueue, () => this.workerJoinQueue());
		this.socket.on(SocketUrls.UserJoinQueue, (data) =>
			this.userJoinQueue(data)
		);

		this.socket.on(SocketUrls.WorkerPauseQueue, () => this.workerPauseQueue());
		this.socket.on(SocketUrls.WorkerResumeQueue, () =>
			this.workerResumeQueue()
		);
	}

	// Worker join queue
	private async workerJoinQueue() {
		const getQueue = await this.getQueueDataByUserWorker();

		if (!getQueue) {
			return;
		}

		const { queue, worker } = getQueue;

		// Check if worker isn't in queue
		if (
			!queue.workers.some(
				(worker) => worker._id.toString() === worker._id.toString()
			)
		) {
			// Join worker on queue
			await queue.updateOne({
				$push: { workers: worker._id },
			});
		}

		// Emit events to room
		await worker.populate("user");

		this.globalIo.emitGlobalEvent(queue._id.toString(), "WORKER_JOINED_QUEUE", {
			worker,
		});

		// Join queue room
		this.socket.join(queue._id.toString());
		// Join barber room
		await this.socket.join(worker.barber._id.toString());

		// Emit queue data event to all workers
		const updatedQueue = await QueueModel.findById(queue._id);

		if (updatedQueue) {
			await updatedQueue.populateAll();
			this.globalIo.io.emit(SocketUrls.GetQueue, { queue: updatedQueue });
		}
	}
	// User join queue
	private async userJoinQueue(data: any) {
		const { code, serviceId } = data;

		const service = await ServicesModel.findById(serviceId);

		if (!service) {
			return;
		}

		const barber = await BarbersModel.findOne({ code });

		if (!barber) {
			this.globalIo.emitEvent(this.socket, "BARBER_NOT_FOUND");
			return;
		}

		if (!barber.open) {
			this.globalIo.emitEvent(this.socket, "BARBER_IS_CLOSED");
			return;
		}

		const queue = await QueueModel.findBarberTodayQueue(barber._id.toString());

		if (!queue) {
			this.globalIo.emitEvent(this.socket, "QUEUE_NOT_FOUND");
			return;
		}

		// Check if user is already in queue

		// Calculate position

		// Check if user is already a customer in barber
		const isCustomer = barber.customers.find(
			(customerId) => customerId.toString() === this.user._id.toString()
		);
		// Create ticket for queue
		const ticket = await TicketsModel.create({
			queue: { queueDTO: queue._id, position: 0 },
			type: "queue",
			customer: this.user._id,
			service: service._id,
			barber: barber._id,
			approved: isCustomer,
			status: isCustomer ? "queue" : "pending",
		});

		if (!ticket) {
			this.globalIo.emitEvent(this.socket, "TICKET_NOT_CREATED");
			return;
		}

		await queue.updateOne({
			$push: {
				tickets: ticket._id,
			},
		});
		await queue.save();

		// Join queue room
		await this.socket.join(queue._id.toString());
		// Join ticket room
		await this.socket.join(ticket._id.toString());

		// Emit ticket data to user
		this.socket.emit(SocketUrls.GetTicket, {
			ticket,
		});
		// Emit queue data to workers
		const updatedQueue = await QueueModel.findById(queue._id);
		await updatedQueue?.populateAll();
		this.socket.to(queue._id.toString()).emit(SocketUrls.GetQueue, {
			queue: updatedQueue,
		});

		// Emit events to room
		this.globalIo.emitGlobalEvent(barber._id.toString(), "USER_JOINED");

		// Create notification for workers
		const messageType: NotificationMessageType = isCustomer
			? "CUSTOMER_JOINED_QUEUE"
			: "USER_ASK_TO_JOIN_QUEUE";

		await NotificationsRepository.notifyQueueWorkers(
			queue._id.toString(),
			messageType,
			{
				service,
			},
			this.user.avatar._id.toString()
		);
	}
	// Worker leave queue
	private workerLeaveQueue() {}
	// User leave queue
	private userLeaveQueue() {}
	// Worker serve customer
	private async workerServeCustomer() {
		const getQueue = await this.getQueueDataByUserWorker();

		if (!getQueue) {
			return;
		}

		const { queue, worker } = getQueue;
	}
	// Worker miss customer
	private async workerMissCustomer() {
		const getQueue = await this.getQueueDataByUserWorker();

		if (!getQueue) {
			return;
		}

		const { queue, worker } = getQueue;
	}
	// Worker approve customer request
	private workerApproveCustomerRequest() {}
	// Worker deny customer request
	private workerDenyCustomerRequest() {}
	// Worker finish queue
	private workerFinishQueue() {}
	// Worker pause queue
	private async workerPauseQueue() {
		const getQueue = await this.getQueueDataByUserWorker();

		if (!getQueue) {
			return;
		}

		const { queue, worker } = getQueue;

		await queue.updateOne({
			status: "paused",
		});

		// Emit events to room
		this.globalIo.emitGlobalEvent(queue._id.toString(), "QUEUE_PAUSED", {
			worker,
		});

		// Emit queue data event to all workers
		const updatedQueue = await QueueModel.findById(queue._id);
		if (updatedQueue) {
			this.globalIo.io
				.to(queue._id.toString())
				.emit(SocketUrls.GetQueue, { queue: updatedQueue });
		}
	}
	// Worker resume queue
	private async workerResumeQueue() {
		const getQueue = await this.getQueueDataByUserWorker();

		if (!getQueue) {
			return;
		}

		const { queue, worker } = getQueue;

		await queue.updateOne({
			status: "on",
		});

		// Emit events to room
		this.globalIo.emitGlobalEvent(queue._id.toString(), "QUEUE_RESUMED", {
			worker,
		});

		// Emit queue data event to all workers
		const updatedQueue = await QueueModel.findById(queue._id);
		this.globalIo.io
			.to(queue._id.toString())
			.emit(SocketUrls.GetQueue, { queue: updatedQueue });
	}
}
