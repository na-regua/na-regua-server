'use strict';var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){function adopt(value){return value instanceof P?value:new P(function(resolve){resolve(value);});}return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}function rejected(value){try{step(generator['throw'](value));}catch(e){reject(e);}}function step(result){result.done?resolve(result.value):adopt(result.value).then(fulfilled,rejected);}step((generator=generator.apply(thisArg,_arguments||[])).next());});};Object.defineProperty(exports,'__esModule',{value:true});exports.QueueModel=void 0;const date_1=require('../../../utils/date');const mongoose_1=require('mongoose');const uniqueValidator=require('mongoose-unique-validator');const QueueSchema=new mongoose_1.Schema({status:{type:String,enum:['on','off','paused'],default:'on'},workers:{type:[mongoose_1.Schema.Types.ObjectId],ref:'Workers',required:true},barber:{type:mongoose_1.Schema.Types.ObjectId,ref:'Barbers',required:true},schedules:{type:[mongoose_1.Schema.Types.ObjectId],ref:'Tickets'},tickets:{type:[mongoose_1.Schema.Types.ObjectId],ref:'Tickets'},serveds:{type:[mongoose_1.Schema.Types.ObjectId],ref:'Tickets'},misseds:{type:[mongoose_1.Schema.Types.ObjectId],ref:'Tickets'},finished:{type:Boolean,default:false},finishedAt:{type:Date},finishedBy:{type:mongoose_1.Schema.Types.ObjectId,ref:'Workers'}},{versionKey:false,timestamps:true,collection:'Queues'});QueueSchema.plugin(uniqueValidator,{message:'{PATH} já está em uso.'});QueueSchema.methods.populateAll=function(){return __awaiter(this,void 0,void 0,function*(){const queue=this;yield queue.populate({path:'workers',populate:{path:'user'}});yield queue.populate({path:'tickets',populate:[{path:'customer',populate:{path:'avatar'}},{path:'service'}],options:{sort:{approved:1,position:0}}});});};QueueSchema.statics.findLastPositionOfTicket=function(queueId){return __awaiter(this,void 0,void 0,function*(){const model=this;const queue=yield model.findById(queueId);yield queue===null||queue===void 0?void 0:queue.populateAll();const approvedTickets=(queue===null||queue===void 0?void 0:queue.tickets).filter(el=>el.approved===true);if(approvedTickets&&approvedTickets.length>0){const lastTicket=approvedTickets.reduce((prev,curr)=>prev.position>curr.position?prev:curr);return lastTicket.position;}return 0;});};QueueSchema.statics.findBarberTodayQueue=function(barberId,otherParams){return __awaiter(this,void 0,void 0,function*(){const model=this;const {nextDay,today}=(0,date_1.getTodayAndNextTo)(1);const params=Object.assign({status:{$in:['on','paused']},createdAt:{$gte:today,$lt:nextDay}},otherParams);if(barberId){params.barber=barberId;}const queue=yield model.findOne(params);yield queue===null||queue===void 0?void 0:queue.populateAll();return queue;});};const QueueModel=(0,mongoose_1.model)('Queues',QueueSchema);exports.QueueModel=QueueModel;