import {
	IQueueDocument,
	IUserDocument,
	IWorkerDocument,
	QueueModel,
	TicketsModel,
	WorkersModel,
} from "@api/modules";
import { Socket } from "socket.io";
import { GlobalSocket } from "../../../app";
import { SocketUrls } from "../SocketModel";

export class QueueSocketEvents {
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

	init(): void {
		this.socket.on(SocketUrls.UserJoinTicketChannels, (data) =>
			this.user_join_ticket_channels(data)
		);
		this.socket.on(SocketUrls.UserLeaveTicketChannels, (data) =>
			this.user_leave_queue_channels(data)
		);
		this.socket.on(SocketUrls.WorkerJoinQueueChannels, () =>
			this.worker_join_queue_channels()
		);

		this.socket.on(SocketUrls.WorkerPauseQueue, () => this.workerPauseQueue());
		this.socket.on(SocketUrls.WorkerResumeQueue, () =>
			this.workerResumeQueue()
		);
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

	// User join ticket channels
	private async user_join_ticket_channels(data: any) {
		const { ticketId: ticket_id } = data;

		const ticket = await TicketsModel.findById(ticket_id);

		if (ticket && ticket.type === "queue" && ticket.queue) {
			const queue = await QueueModel.findById(ticket.queue.queue_dto);

			if (queue) {
				this.socket.join(ticket._id.toString());
			}
		}
	}
	// User left queue channels
	private async user_leave_queue_channels(data: any) {
		const { ticketId: ticket_id } = data;

		const ticket = await TicketsModel.findById(ticket_id);

		if (ticket && ticket.type === "queue" && ticket.queue) {
			const queue = await QueueModel.findById(ticket.queue.queue_dto);

			if (queue) {
				this.socket.leave(ticket._id.toString());
			}
		}
	}
	// Worker join queue channels

	// Worker left queue channels
	private async worker_join_queue_channels() {
		const getQueue = await this.getQueueDataByUserWorker();

		if (!getQueue) {
			return;
		}

		const { queue, worker } = getQueue;

		// Join queue room
		await this.socket.join(queue._id.toString());
		// Join worker room
		await this.socket.join(worker._id.toString());
		// Join barber room
		await this.socket.join(worker.barber._id.toString());
	}

	// Worker leave queue
	private workerLeaveQueue() {}

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

	// Worker deny customer request

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
		const updatedQueue = await QueueModel.findById(queue._id.toString());
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
		const updatedQueue = await QueueModel.findById(queue._id.toString());
		if (updatedQueue) {
			this.globalIo.io
				.to(queue._id.toString())
				.emit(SocketUrls.GetQueue, { queue: updatedQueue });
		}
	}
}
