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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersSchema = exports.UsersModel = exports.TOKEN_SECRET = void 0;
const HttpException_1 = require("@core/HttpException/HttpException");
const SystemErrors_1 = require("@core/SystemErrors/SystemErrors");
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const isEmail_1 = __importDefault(require("validator/lib/isEmail"));
const Twilio_client_1 = __importDefault(require("../Twilio/Twilio.client"));
const uniqueValidator = require("mongoose-unique-validator");
const TOKEN_SECRET = process.env.TOKEN_SECRET || "naRegua";
exports.TOKEN_SECRET = TOKEN_SECRET;
const UsersSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\([1-9]{2}\) (?:[2-8]|9[0-9])[0-9]{3}\-[0-9]{4}$/,
            "Telefone inválido",
        ],
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate: [isEmail_1.default, SystemErrors_1.SYSTEM_ERRORS.INVALID_EMAIL],
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    avatar: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Files",
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "worker", "custommer"],
    },
    temporaryPassword: Boolean,
    accessToken: String,
    phoneConfirmed: {
        type: Boolean,
        default: false,
    },
}, {
    versionKey: false,
    timestamps: true,
    collection: "Users",
});
exports.UsersSchema = UsersSchema;
UsersSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });
UsersSchema.methods.generateAuthToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const token = (0, jsonwebtoken_1.sign)({ _id: user._id }, TOKEN_SECRET, {
            expiresIn: "24h",
        });
        user.accessToken = token;
        yield user.save();
        return token;
    });
};
UsersSchema.methods.toJSON = function () {
    const _a = this.toObject(), { password, accessToken } = _a, user = __rest(_a, ["password", "accessToken"]);
    return user;
};
UsersSchema.statics.findByCredentials = function (email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        let UserModel = this;
        const user = yield UserModel.findOne({ email });
        if (!user) {
            throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.USER_NOT_FOUND);
        }
        if (!(0, bcryptjs_1.compareSync)(password, user.password)) {
            throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.INVALID_PASSWORD);
        }
        return user;
    });
};
UsersSchema.statics.findByPhone = function (phone) {
    return __awaiter(this, void 0, void 0, function* () {
        let UserModel = this;
        const user = UserModel.findOne({ phone });
        if (!user) {
            throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.USER_NOT_FOUND);
        }
        return user;
    });
};
UsersSchema.statics.findByToken = function (token) {
    return __awaiter(this, void 0, void 0, function* () {
        const UsersModel = this;
        let decoded;
        try {
            decoded = (0, jsonwebtoken_1.verify)(token, TOKEN_SECRET);
        }
        catch (_a) {
            throw new HttpException_1.HttpException(401, SystemErrors_1.SYSTEM_ERRORS.UNAUTHORIZED);
        }
        const user = yield UsersModel.findOne({
            _id: decoded._id,
        });
        if (!user) {
            throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.USER_NOT_FOUND);
        }
        return user;
    });
};
UsersSchema.methods.verifyPhone = function (phone, code) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const verification = yield Twilio_client_1.default.verifyOTP(code, user.phone);
        if (!verification || !verification.valid) {
            throw new HttpException_1.HttpException(400, SystemErrors_1.SYSTEM_ERRORS.INVALID_CODE);
        }
        yield user.updateOne({ phoneConfirmed: true });
    });
};
UsersSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (user.isModified("password")) {
            user.password = (0, bcryptjs_1.hashSync)(user.password, 12);
        }
        next();
    });
});
const UsersModel = (0, mongoose_2.model)("Users", UsersSchema);
exports.UsersModel = UsersModel;
