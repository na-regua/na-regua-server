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
		this.socket.on(SocketUrls.WorkerLeaveQueueChannels, () =>
			this.worker_leave_queue()
		);

		this.socket.on(SocketUrls.WorkerPauseQueue, () =>
			this.worker_pause_queue()
		);
		this.socket.on(SocketUrls.WorkerResumeQueue, () =>
			this.worker_resume_queue()
		);
	}

	private async get_queue_and_worker(): Promise<{
		queue: IQueueDocument;
		worker: IWorkerDocument;
	} | null> {
		const workerId = this.user.worker?._id.toString();

		const worker = await WorkersModel.findById(workerId);

		if (!worker) {
			return null;
		}

		await worker.populate("barber");

		const queue = await QueueModel.findBarberTodayQueue(
			worker.barber._id.toString()
		);

		if (!queue) {
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
				this.socket.join(queue._id.toString());
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
		const queue_and_worker = await this.get_queue_and_worker();

		if (!queue_and_worker) {
			return;
		}

		const { queue, worker } = queue_and_worker;

		// Join queue room
		await this.socket.join(queue._id.toString());
		// Join worker room
		await this.socket.join(worker._id.toString());
		// Join barber room
		await this.socket.join(worker.barber._id.toString());
	}

	// Worker leave queue
	private async worker_leave_queue() {
		const queue_and_worker = await this.get_queue_and_worker();

		if (!queue_and_worker) {
			return;
		}

		const { queue, worker } = queue_and_worker;

		// Leave queue room
		await this.socket.leave(queue._id.toString());
		// Leave worker room
		await this.socket.leave(worker._id.toString());
		// Leave barber room
		await this.socket.leave(worker.barber._id.toString());
	}

	// Worker serve customer
	private async worker_serve_customer() {
		const getQueue = await this.get_queue_and_worker();

		if (!getQueue) {
			return;
		}

		const { queue, worker } = getQueue;
	}
	// Worker miss customer
	private async worker_miss_customer() {
		const getQueue = await this.get_queue_and_worker();

		if (!getQueue) {
			return;
		}

		const { queue, worker } = getQueue;
	}
	// Worker finish queue

	// Worker deny customer request

	// Worker pause queue
	private async worker_pause_queue() {
		const getQueue = await this.get_queue_and_worker();

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
			await updatedQueue.populateAll();
			this.globalIo.io
				.to(queue._id.toString())
				.emit(SocketUrls.GetQueue, { queue: updatedQueue });
		}
	}
	// Worker resume queue
	private async worker_resume_queue() {
		const getQueue = await this.get_queue_and_worker();

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
			await updatedQueue.populateAll();
			this.globalIo.io
				.to(queue._id.toString())
				.emit(SocketUrls.GetQueue, { queue: updatedQueue });
		}
	}
}
