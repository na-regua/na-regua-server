export interface SocketQueueEvent {
	queueId?: string;
}

export interface ISocketEvent {
	event: ISocketEventType;
	data: any;
}

export type ISocketEventType =
	| "WORKER_JOINED_QUEUE"
	| 'WORKER_NOT_OWNER'
	| "QUEUE_NOT_FOUND"
	| "QUEUE_CUSTOMER_NOT_FOUND"
	| "QUEUE_CUSTOMER_NOT_CREATED"
	| "QUEUE_CUSTOMER_NOT_IN_QUEUE"
	| "USER_DENIED"
	| "USER_APPROVED";
