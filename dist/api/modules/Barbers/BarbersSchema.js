'use strict';var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){function adopt(value){return value instanceof P?value:new P(function(resolve){resolve(value);});}return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}function rejected(value){try{step(generator['throw'](value));}catch(e){reject(e);}}function step(result){result.done?resolve(result.value):adopt(result.value).then(fulfilled,rejected);}step((generator=generator.apply(thisArg,_arguments||[])).next());});};Object.defineProperty(exports,'__esModule',{value:true});exports.getDayToWorkDays=exports.BarbersSchema=exports.BarbersModel=void 0;const mongoose_1=require('mongoose');const Socket_1=require('../../../core/Socket');const SystemErrors_1=require('../../../core/SystemErrors/SystemErrors');const app_1=require('app');const mongoose_2=require('mongoose');const Tickets_1=require('../Tickets');const Users_1=require('../Users');const uniqueValidator=require('mongoose-unique-validator');const AddressSchema=new mongoose_2.Schema({cep:{type:String,required:true,match:[/^\d{5}-\d{3}$/,SystemErrors_1.SYSTEM_ERRORS.INVALID_CEP]},city:{type:String,required:true},uf:{type:String,required:true},neighborhood:{type:String,required:true},street:{type:String,required:true},number:{type:Number,required:true},complement:String},{versionKey:false,timestamps:false,_id:false});const getDayToWorkDays={0:'sun',1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat'};exports.getDayToWorkDays=getDayToWorkDays;const AttendanceSchema=new mongoose_2.Schema({workdays:{type:[String],enum:['mon','tue','wed','thu','fri','sat','sun'],default:['mon','tue','wed','thu','fri']},worktime:{start:{type:String,default:'08:00'},end:{type:String,default:'17:00'}},open_barber_auto:{type:Boolean,default:false},open_queue_auto:{type:Boolean,default:false},schedule_limit_days:{type:Number,enum:[7,15,30],default:30},schedules_by_day:{type:Number,default:4,required:true},schedule_times:{type:[String]}},{versionKey:false,timestamps:false,_id:false});const BarbersSchema=new mongoose_2.Schema({name:{type:String,required:true},description:{type:String},email:{type:String,required:true,unique:true},address:{type:AddressSchema,required:true},phone:{type:Number,required:true,unique:true},verified:{type:Boolean,default:false},status:{type:String,enum:['active','inactive'],default:'active'},profile_status:{type:String,enum:['pre','completed'],default:'pre'},code:{type:String,unique:true},avatar:{type:mongoose_2.Schema.Types.ObjectId,ref:'Files'},thumbs:{type:[mongoose_2.Schema.Types.ObjectId],ref:'Files'},config:{type:AttendanceSchema},open:{type:Boolean,default:false},customers:{type:[mongoose_2.Schema.Types.ObjectId],ref:'Users',default:[]},rating:{type:Number,default:0}},{versionKey:false,collection:'Barbers',timestamps:true});exports.BarbersSchema=BarbersSchema;BarbersSchema.plugin(uniqueValidator,{message:'{PATH} já está em uso.'});BarbersSchema.methods.toJSON=function(){const barber=this.toObject();return barber;};BarbersSchema.methods.populateAll=function(){return __awaiter(this,void 0,void 0,function*(){yield this.populate('avatar');yield this.populate('thumbs');yield this.populate('customers');return this;});};BarbersSchema.methods.updateRating=function(){return __awaiter(this,void 0,void 0,function*(){const barber=this;const ratings=yield Tickets_1.TicketsModel.find({barber:barber._id.toString(),status:'served',rate:{$ne:null}});const sum=ratings.reduce((total,item)=>{var _a;return total+(((_a=item.rate)===null||_a===void 0?void 0:_a.rating)||0);},0);const avg=sum/ratings.length;const rounded=Math.round(avg*2)/2;const rating=Math.max(0,Math.min(5,rounded));yield barber.updateOne({rating},{},{new:true});yield barber.save();});};BarbersSchema.statics.updateLiveInfo=function(barber_id,data){return __awaiter(this,void 0,void 0,function*(){const updatedBarber=yield this.findById(barber_id);if(updatedBarber){yield updatedBarber.populateAll();const socketUrl=Socket_1.SocketUrls.BarberInfo.replace('{{barberId}}',barber_id);app_1.GlobalSocket.io.emit(socketUrl,Object.assign({barber:updatedBarber,is_open:updatedBarber.open},data));if(updatedBarber.open){const customersOrFavorites=yield Users_1.UsersModel.find({$or:[{favorites:updatedBarber._id},{_id:{$in:updatedBarber.customers}}]});if(customersOrFavorites){const notifyUrl=Socket_1.SocketUrls.BarberInfoNotification.replace('{{barberId}}',barber_id);customersOrFavorites.forEach(customer=>__awaiter(this,void 0,void 0,function*(){app_1.GlobalSocket.io.to(customer._id.toString()).emit(Socket_1.SocketUrls.NewNotification,{notification:{message:'BARBER_IS_ON',data:{barber:updatedBarber}}});}));}}}});};BarbersSchema.pre('save',function(next){return __awaiter(this,void 0,void 0,function*(){const barber=this;next();});});const BarbersModel=(0,mongoose_1.model)('Barbers',BarbersSchema);exports.BarbersModel=BarbersModel;