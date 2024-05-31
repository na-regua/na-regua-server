import { IUserDocument } from "@api/modules";
import { Socket } from "socket.io";
import { GlobalSocket } from "../../../app";

export class GeneralSocketEvents {
	socket!: Socket;
	user!: IUserDocument;

	globalIo = GlobalSocket;

	constructor(socket: Socket, user: IUserDocument) {
		this.socket = socket;
		this.user = user;
	}

	init(): void {
		// this.socket.on(SocketUrls.UserJoinTicketChannels, (data) =>
		// 	this.userJoinTicketChannels(data)
		// );
	}
}
