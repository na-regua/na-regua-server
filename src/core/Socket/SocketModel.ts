export enum SocketUrls {
	WorkerJoinQueue = "queue/worker/join",
	WorkerLeaveQueue = "queue/worker/leave",
	WorkerServeCustomer = "queue/worker/serve",
	WorkerMissCustomer = "queue/worker/miss",
	WorkerApproveCustomerRequest = "queue/worker/approve",
	WorkerDenyCustomerRequest = "queue/worker/deny",
	WorkerFinishQueue = "queue/worker/finish",
	WorkerPauseQueue = "queue/worker/pause",
	WorkerResumeQueue = "queue/worker/resume",

	UserJoinTicketChannels = "channel/user/join/ticket",
	UserLeaveTicketChannels = "channel/user/leave/ticket",

	GetQueue = "queue/get",
	GetTicket = "ticket/get",

	NewNotification = "notifications/new",
	Event = "events",
}

export interface SocketQueueEvent {
	queueId?: string;
}

export interface ISocketEvent {
	event: ISocketEventType;
	data: any;
}

export type ISocketEventType =
	| "WORKER_JOINED_QUEUE"
	| "WORKER_NOT_OWNER"
	| "WORKER_IS_NOT_IN_QUEUE"
	| "WORKER_IS_ALREADY_IN_QUEUE"
	| "WORKER_NOT_FOUND"
	| "TICKET_SERVED"
	| "TICKET_MISSED"
	| "TICKET_REMOVED"
	| "TICKET_NOT_FOUND"
	| "TICKET_NOT_CREATED"
	| "TICKET_IS_NOT_IN_QUEUE"
	| "QUEUE_FINISHED"
	| "QUEUE_PAUSED"
	| "QUEUE_RESUMED"
	| "QUEUE_OFF"
	| "QUEUE_NOT_FOUND"
	| "BARBER_NOT_FOUND"
	| "BARBER_IS_CLOSED"
	| "USER_IS_NOT_WORKER"
	| "USER_DENIED"
	| "USER_APPROVED"
	| "USER_JOINED"
	| "WORKER_APPROVED_YOU"
	| "WORKER_DENIED_YOU"
	| "USER_ALREADY_IN_QUEUE"
	| "USER_IN_OTHER_QUEUE";
