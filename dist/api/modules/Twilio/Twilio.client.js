"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("@core/HttpException/HttpException");
const SystemErrors_1 = require("@core/SystemErrors/SystemErrors");
const twilio_1 = __importDefault(require("twilio"));
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } = process.env;
const client = (0, twilio_1.default)(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
class TwilioRepository {
    sendOTP(phone) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!TWILIO_SERVICE_SID) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.UNAVAILABLE_MESSAGE_SERVICE);
                }
                const OTPResponse = yield client.verify.v2
                    .services(TWILIO_SERVICE_SID)
                    .verifications.create({
                    to: `+55 ${phone}`,
                    channel: "whatsapp",
                });
                return OTPResponse;
            }
            catch (error) {
                throw error;
            }
        });
    }
    verifyOTP(code, phone) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!TWILIO_SERVICE_SID) {
                    throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.UNAVAILABLE_MESSAGE_SERVICE);
                }
                const OTPResponse = yield client.verify.v2
                    .services(TWILIO_SERVICE_SID)
                    .verificationChecks.create({
                    to: `+55 ${phone}`,
                    code,
                });
                return OTPResponse;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new TwilioRepository();
