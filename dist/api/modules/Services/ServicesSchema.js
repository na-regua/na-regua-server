'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports.ServicesSchema=exports.ServicesModel=void 0;const mongoose_1=require('mongoose');const uniqueValidator=require('mongoose-unique-validator');const ServicesSchema=new mongoose_1.Schema({barber:{type:mongoose_1.Schema.Types.ObjectId,ref:'Barbers',required:true},name:{type:String,required:true,unique:true,minLength:3},price:{type:Number,required:true,min:0},duration_in_minutes:{type:Number,required:true,min:0},icon:{type:String,enum:['navalha','maquina','pente'],required:true},additional:{type:Boolean,default:false}},{versionKey:false,timestamps:true,collection:'Services'});exports.ServicesSchema=ServicesSchema;ServicesSchema.plugin(uniqueValidator,{message:'{PATH} já está em uso.'});const ServicesModel=(0,mongoose_1.model)('Services',ServicesSchema);exports.ServicesModel=ServicesModel;