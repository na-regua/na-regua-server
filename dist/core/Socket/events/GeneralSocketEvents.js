'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports.GeneralSocketEvents=void 0;const app_1=require('../../../app');class GeneralSocketEvents{constructor(socket,user){this.globalIo=app_1.GlobalSocket;this.socket=socket;this.user=user;}init(){}}exports.GeneralSocketEvents=GeneralSocketEvents;