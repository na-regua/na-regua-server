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

	| "USER_IS_NOT_WORKER"
	| "USER_DENIED"
	| "USER_APPROVED"
	| "USER_JOINED";
