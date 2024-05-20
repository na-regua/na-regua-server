import {
	BarbersModel,
	IQueueDocument,
	ITicketsDocument,
	IUserDocument,
	IWorkerDocument,
	NotificationMessageType,
	QueueModel,
	ServicesModel,
	TicketsModel,
	WorkersModel,
} from "@api/modules";
import NotificationsRepository from "@api/modules/Notifications/NotificationsRepository";
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
		this.socket.on(SocketUrls.WorkerJoinQueue, () => this.workerJoinQueue());
		this.socket.on(SocketUrls.UserJoinTicketChannels, (data) =>
			this.userJoinTicketChannels(data)
		);
		this.socket.on(SocketUrls.UserLeaveTicketChannels, (data) =>
			this.userLeaveQueueChannels(data)
		);

		this.socket.on(SocketUrls.WorkerPauseQueue, () => this.workerPauseQueue());
		this.socket.on(SocketUrls.WorkerResumeQueue, () =>
			this.workerResumeQueue()
		);

		this.socket.on(SocketUrls.WorkerDenyCustomerRequest, (data) =>
			this.workerDenyCustomerRequest(data)
		);
		this.socket.on(SocketUrls.WorkerApproveCustomerRequest, (data) =>
			this.workerApproveCustomerRequest(data)
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
		await this.socket.join(queue._id.toString());
		// Join barber room
		await this.socket.join(worker.barber._id.toString());

		// Emit queue data event to all workers
		const updatedQueue = await QueueModel.findById(queue._id);

		if (updatedQueue) {
			await updatedQueue.populateAll();
			this.globalIo.io.emit(SocketUrls.GetQueue, { queue: updatedQueue });
		}
	}
	// User join queue channels
	private async userJoinTicketChannels(data: any) {
		const { ticketId } = data;

		const ticket = await TicketsModel.findById(ticketId);

		if (ticket && ticket.type === "queue" && ticket.queue) {
			const queue = await QueueModel.findById(ticket.queue.queue_dto);

			if (queue) {
				this.socket.join(queue._id.toString());
				this.socket.join(ticket._id.toString());
			}
		}
	}
	// User left queue channels
	private async userLeaveQueueChannels(data: any) {
		const { ticketId } = data;

		const ticket = await TicketsModel.findById(ticketId);

		if (ticket && ticket.type === "queue" && ticket.queue) {
			const queue = await QueueModel.findById(ticket.queue.queue_dto);

			if (queue) {
				this.socket.leave(queue._id.toString());
				this.socket.leave(ticket._id.toString());
			}
		}
	}
	// Worker join queue channels

	// Worker left queue channels
	private workerLeftQueueChannels() {}

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
	private async workerApproveCustomerRequest(data: any) {
		const getQueue = await this.getQueueDataByUserWorker();

		if (!getQueue) {
			return;
		}

		const { queue, worker } = getQueue;

		// Check if ticket exists
		const { ticketId } = data;

		const ticket = await TicketsModel.findById(ticketId);

		if (!ticket) {
			return;
		}

		// Check if ticket is in queue
		if (!queue.tickets.some((t) => t._id.toString() === ticketId)) {
			return;
		}

		// Update ticket status
		const newStatus = ticket.type === "queue" ? "queue" : "scheduled";

		await ticket.updateOne({ approved: true, status: newStatus });

		await worker.populate("barber");
		await worker.populate("user");
		await ticket.populateAll();

		// Emit event to ticket user
		const updatedTicket = await TicketsModel.findById(ticket._id);

		if (updatedTicket) {
			await updatedTicket.populateAll();

			this.globalIo.io
				.to(ticket.customer._id.toString())
				.emit(SocketUrls.GetTicket, { ticket: updatedTicket });
		}

		// Emit events to other queue workers
		const otherBarbers = queue.workers.filter(
			(w) => w._id.toString() !== worker._id.toString()
		);

		if (otherBarbers.length > 0) {
			otherBarbers.forEach((w) => {
				this.globalIo.emitGlobalEvent(w._id.toString(), "USER_APPROVED", {
					customer: ticket.customer,
					worker,
				});
			});
		}

		// Emit queue data to queue workers
		const updatedQueue = await QueueModel.findById(queue._id);

		if (updatedQueue) {
			await updatedQueue.populateAll();
			this.globalIo.io
				.to(queue._id.toString())
				.emit(SocketUrls.GetQueue, { queue: updatedQueue });
		}

		// Create notification for customer
		const barber = await BarbersModel.findById(worker.barber._id.toString());

		if (barber) {
			await barber.updateOne({
				$push: {
					customers: ticket.customer._id.toString(),
				},
			});

			const messageType: NotificationMessageType =
				"WORKER_ADD_USER_AS_CUSTOMER";

			await NotificationsRepository.notifyUser(
				ticket.customer._id.toString(),
				messageType,
				{ worker },
				(worker.user as any).avatar._id.toString()
			);
		}
	}
	// Worker deny customer request
	private async workerDenyCustomerRequest(data: any) {
		const getQueue = await this.getQueueDataByUserWorker();

		if (!getQueue) {
			return;
		}

		const { queue, worker } = getQueue;

		// Check if ticket exists
		const { ticketId } = data;

		const ticket = await TicketsModel.findById(ticketId);

		if (!ticket) {
			return;
		}

		// Check if ticket is in queue
		if (!queue.tickets.some((t) => t._id.toString() === ticketId)) {
			return;
		}

		// Remove ticket from queue
		await queue.updateOne({
			$pull: {
				tickets: ticket._id.toString(),
			},
			$push: {
				misseds: ticket._id.toString(),
			},
		});

		// Update ticket status
		await ticket.updateOne({
			approved: false,
			status: "missed",
			missedAt: new Date(),
		});

		await worker.populate("barber");
		await worker.populate("user");
		await ticket.populateAll();

		// Emit event to ticket user

		this.globalIo.emitGlobalEvent(
			ticket.customer._id.toString(),
			"WORKER_DENIED_YOU",
			{
				worker,
			}
		);

		const updatedTicket = await TicketsModel.findById(ticket._id);

		if (updatedTicket) {
			await updatedTicket.populateAll();
			this.globalIo.io
				.to(ticket.customer._id.toString())
				.emit(SocketUrls.GetTicket, { ticket: updatedTicket });
		}

		// Emit events to barber workers
		const otherBarbers = queue.workers.filter(
			(w) => w._id.toString() !== worker._id.toString()
		);

		if (otherBarbers.length > 0) {
			otherBarbers.forEach((w) => {
				this.globalIo.emitGlobalEvent(w._id.toString(), "USER_APPROVED", {
					customer: ticket.customer,
					worker,
				});
			});
		}

		// Emit queue data to queue workers
		const updatedQueue = await QueueModel.findById(queue._id);

		if (updatedQueue) {
			await updatedQueue.populateAll();
			this.socket
				.to(queue._id.toString())
				.emit(SocketUrls.GetQueue, { queue: updatedQueue });
		}
	}
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
