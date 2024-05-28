'use strict';var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){function adopt(value){return value instanceof P?value:new P(function(resolve){resolve(value);});}return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}function rejected(value){try{step(generator['throw'](value));}catch(e){reject(e);}}function step(result){result.done?resolve(result.value):adopt(result.value).then(fulfilled,rejected);}step((generator=generator.apply(thisArg,_arguments||[])).next());});};var __importDefault=this&&this.__importDefault||function(mod){return mod&&mod.__esModule?mod:{'default':mod};};Object.defineProperty(exports,'__esModule',{value:true});exports.QueueSocketEvents=void 0;const modules_1=require('../../../api/modules');const NotificationsRepository_1=__importDefault(require('../../../api/modules/Notifications/NotificationsRepository'));const app_1=require('../../../app');const SocketModel_1=require('../SocketModel');class QueueSocketEvents{constructor(socket,user){this.filters={showAllTickets:false};this.globalIo=app_1.GlobalSocket;this.socket=socket;this.user=user;}init(){this.socket.on(SocketModel_1.SocketUrls.UserJoinTicketChannels,data=>this.userJoinTicketChannels(data));this.socket.on(SocketModel_1.SocketUrls.UserLeaveTicketChannels,data=>this.userLeaveQueueChannels(data));this.socket.on(SocketModel_1.SocketUrls.WorkerJoinQueueChannels,()=>this.workerJoinQueueChannels());this.socket.on(SocketModel_1.SocketUrls.WorkerPauseQueue,()=>this.workerPauseQueue());this.socket.on(SocketModel_1.SocketUrls.WorkerResumeQueue,()=>this.workerResumeQueue());this.socket.on(SocketModel_1.SocketUrls.WorkerDenyCustomerRequest,data=>this.workerDenyCustomerRequest(data));this.socket.on(SocketModel_1.SocketUrls.WorkerApproveCustomerRequest,data=>this.workerApproveCustomerRequest(data));}getQueueDataByUserWorker(){var _a;return __awaiter(this,void 0,void 0,function*(){const workerId=(_a=this.user.worker)===null||_a===void 0?void 0:_a._id.toString();const worker=yield modules_1.WorkersModel.findById(workerId);if(!worker){this.globalIo.emitEvent(this.socket,'WORKER_NOT_FOUND');return null;}const queue=yield modules_1.QueueModel.findBarberTodayQueue(worker.barber._id.toString());if(!queue){this.globalIo.emitEvent(this.socket,'QUEUE_NOT_FOUND');return null;}return{queue,worker};});}userJoinTicketChannels(data){return __awaiter(this,void 0,void 0,function*(){const {ticketId}=data;const ticket=yield modules_1.TicketsModel.findById(ticketId);if(ticket&&ticket.type==='queue'&&ticket.queue){const queue=yield modules_1.QueueModel.findById(ticket.queue.queue_dto);if(queue){this.socket.join(queue._id.toString());this.socket.join(ticket._id.toString());}}});}userLeaveQueueChannels(data){return __awaiter(this,void 0,void 0,function*(){const {ticketId}=data;const ticket=yield modules_1.TicketsModel.findById(ticketId);if(ticket&&ticket.type==='queue'&&ticket.queue){const queue=yield modules_1.QueueModel.findById(ticket.queue.queue_dto);if(queue){this.socket.leave(queue._id.toString());this.socket.leave(ticket._id.toString());}}});}workerJoinQueueChannels(){return __awaiter(this,void 0,void 0,function*(){const getQueue=yield this.getQueueDataByUserWorker();if(!getQueue){return;}const {queue,worker}=getQueue;yield this.socket.join(queue._id.toString());yield this.socket.join(worker.barber._id.toString());});}workerLeaveQueue(){}userLeaveQueue(){}workerServeCustomer(){return __awaiter(this,void 0,void 0,function*(){const getQueue=yield this.getQueueDataByUserWorker();if(!getQueue){return;}const {queue,worker}=getQueue;});}workerMissCustomer(){return __awaiter(this,void 0,void 0,function*(){const getQueue=yield this.getQueueDataByUserWorker();if(!getQueue){return;}const {queue,worker}=getQueue;});}workerApproveCustomerRequest(data){return __awaiter(this,void 0,void 0,function*(){const getQueue=yield this.getQueueDataByUserWorker();if(!getQueue){return;}const {queue,worker}=getQueue;const {ticketId}=data;const ticket=yield modules_1.TicketsModel.findById(ticketId);if(!ticket){return;}if(!queue.tickets.some(t=>t._id.toString()===ticketId)){return;}const newStatus=ticket.type==='queue'?'queue':'scheduled';yield ticket.updateOne({approved:true,status:newStatus});yield worker.populate('barber');yield worker.populate('user');yield ticket.populateAll();const updatedTicket=yield modules_1.TicketsModel.findById(ticket._id);if(updatedTicket){yield updatedTicket.populateAll();this.globalIo.io.to(ticket.customer._id.toString()).emit(SocketModel_1.SocketUrls.GetTicket,{ticket:updatedTicket});}const otherBarbers=queue.workers.filter(w=>w._id.toString()!==worker._id.toString());if(otherBarbers.length>0){otherBarbers.forEach(w=>{this.globalIo.emitGlobalEvent(w._id.toString(),'USER_APPROVED',{customer:ticket.customer,worker});});}const updatedQueue=yield modules_1.QueueModel.findById(queue._id);if(updatedQueue){yield updatedQueue.populateAll();this.globalIo.io.to(queue._id.toString()).emit(SocketModel_1.SocketUrls.GetQueue,{queue:updatedQueue});}const barber=yield modules_1.BarbersModel.findById(worker.barber._id.toString());if(barber){yield barber.updateOne({$push:{customers:ticket.customer._id.toString()}});const messageType='WORKER_ADD_USER_AS_CUSTOMER';yield NotificationsRepository_1.default.notifyUser(ticket.customer._id.toString(),messageType,{worker},worker.user.avatar._id.toString());}});}workerDenyCustomerRequest(data){return __awaiter(this,void 0,void 0,function*(){const getQueue=yield this.getQueueDataByUserWorker();if(!getQueue){return;}const {queue,worker}=getQueue;const {ticketId}=data;const ticket=yield modules_1.TicketsModel.findById(ticketId);if(!ticket){return;}if(!queue.tickets.some(t=>t._id.toString()===ticketId)){return;}yield queue.updateOne({$pull:{tickets:ticket._id.toString()},$push:{misseds:ticket._id.toString()}});yield ticket.updateOne({approved:false,status:'missed',missedAt:new Date()});yield worker.populate('barber');yield worker.populate('user');yield ticket.populateAll();this.globalIo.emitGlobalEvent(ticket.customer._id.toString(),'WORKER_DENIED_YOU',{worker});const updatedTicket=yield modules_1.TicketsModel.findById(ticket._id);if(updatedTicket){yield updatedTicket.populateAll();this.globalIo.io.to(ticket.customer._id.toString()).emit(SocketModel_1.SocketUrls.GetTicket,{ticket:updatedTicket});}const otherBarbers=queue.workers.filter(w=>w._id.toString()!==worker._id.toString());if(otherBarbers.length>0){otherBarbers.forEach(w=>{this.globalIo.emitGlobalEvent(w._id.toString(),'USER_APPROVED',{customer:ticket.customer,worker});});}const updatedQueue=yield modules_1.QueueModel.findById(queue._id);if(updatedQueue){yield updatedQueue.populateAll();this.socket.to(queue._id.toString()).emit(SocketModel_1.SocketUrls.GetQueue,{queue:updatedQueue});}});}workerFinishQueue(){}workerPauseQueue(){return __awaiter(this,void 0,void 0,function*(){const getQueue=yield this.getQueueDataByUserWorker();if(!getQueue){return;}const {queue,worker}=getQueue;yield queue.updateOne({status:'paused'});this.globalIo.emitGlobalEvent(queue._id.toString(),'QUEUE_PAUSED',{worker});const updatedQueue=yield modules_1.QueueModel.findById(queue._id.toString());if(updatedQueue){this.globalIo.io.to(queue._id.toString()).emit(SocketModel_1.SocketUrls.GetQueue,{queue:updatedQueue});}});}workerResumeQueue(){return __awaiter(this,void 0,void 0,function*(){const getQueue=yield this.getQueueDataByUserWorker();if(!getQueue){return;}const {queue,worker}=getQueue;yield queue.updateOne({status:'on'});this.globalIo.emitGlobalEvent(queue._id.toString(),'QUEUE_RESUMED',{worker});const updatedQueue=yield modules_1.QueueModel.findById(queue._id.toString());if(updatedQueue){this.globalIo.io.to(queue._id.toString()).emit(SocketModel_1.SocketUrls.GetQueue,{queue:updatedQueue});}});}}exports.QueueSocketEvents=QueueSocketEvents;