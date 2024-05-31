'use strict';var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){function adopt(value){return value instanceof P?value:new P(function(resolve){resolve(value);});}return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}function rejected(value){try{step(generator['throw'](value));}catch(e){reject(e);}}function step(result){result.done?resolve(result.value):adopt(result.value).then(fulfilled,rejected);}step((generator=generator.apply(thisArg,_arguments||[])).next());});};Object.defineProperty(exports,'__esModule',{value:true});exports.NotificationsModel=exports.populateNotifications=void 0;const mongoose_1=require('mongoose');const NotificationMessageType=['CUSTOMER_JOINED_QUEUE','CUSTOMER_LEFT_QUEUE','CUSTOMER_SCHEDULED_APPOINTMENT','CUSTOMER_CANCELLED_APPOINTMENT','USER_ASK_TO_JOIN_QUEUE','USER_ASK_TO_SCHEDULE','USER_WILL_BE_LATE_TO_APPOINTMENT','USER_REJECTED_APPOINTMENT_RESCHEDULE','GENERATED_STATEMENT','WORKER_ADD_USER_AS_CUSTOMER','BARBER_IS_ON','OTHERS'];const NotificationDataSchema=new mongoose_1.Schema({service:{type:mongoose_1.Schema.Types.ObjectId,ref:'Services'},user:{type:mongoose_1.Schema.Types.ObjectId,ref:'Users'},customer:{type:mongoose_1.Schema.Types.ObjectId,ref:'Users'},worker:{type:mongoose_1.Schema.Types.ObjectId,ref:'Workers'}},{_id:false,versionKey:false});const NotificationSchema=new mongoose_1.Schema({to:{type:mongoose_1.Schema.Types.ObjectId,ref:'Users',required:true},message:{type:String,required:true,enum:NotificationMessageType,default:'OTHERS'},data:{type:NotificationDataSchema},read:{type:Boolean,default:false},icon:{type:mongoose_1.Schema.Types.ObjectId,ref:'Files'}},{versionKey:false,timestamps:true,collection:'Notifications'});const populateNotifications=function(arr){return __awaiter(this,void 0,void 0,function*(){return Promise.all(arr.map(notification=>__awaiter(this,void 0,void 0,function*(){yield notification.populate('icon');yield notification.populate('to');yield notification.populate('data.service');yield notification.populate('data.user');yield notification.populate('data.customer');yield notification.populate({path:'data.worker',populate:{path:'user barber'}});return notification;})));});};exports.populateNotifications=populateNotifications;const NotificationsModel=(0,mongoose_1.model)('Notifications',NotificationSchema);exports.NotificationsModel=NotificationsModel;