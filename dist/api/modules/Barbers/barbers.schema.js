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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarbersSchema = exports.BarbersModel = void 0;
const mongoose_1 = require("mongoose");
const SystemErrors_1 = require("@core/SystemErrors/SystemErrors");
const mongoose_2 = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const serviceConfigDefinition = {
    schedulesByDay: {
        type: Number,
        default: 4,
        required: true,
    },
    workTime: {
        start: {
            type: String,
            default: "08:00",
        },
        end: {
            type: String,
            default: "17:00",
        },
    },
    schedules: [
        {
            time: {
                type: String,
                required: true,
            },
            recommended: Boolean,
            active: Boolean,
        },
    ],
};
const BarbersSchema = new mongoose_2.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    phoneConfirmed: {
        type: Boolean,
        default: false,
    },
    cep: {
        type: String,
        required: true,
        match: [/^\d{5}-\d{3}$/, SystemErrors_1.SYSTEM_ERRORS.INVALID_CEP],
    },
    city: {
        type: String,
        required: true,
    },
    uf: {
        type: String,
        required: true,
    },
    neighborhood: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    complement: String,
    code: { type: String, unique: true },
    avatar: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "Files",
        required: true,
    },
    profileStatus: {
        type: String,
        enum: ["pre", "completed"],
        default: "pre",
    },
    thumbs: {
        type: [mongoose_2.Schema.Types.ObjectId],
        ref: "Files",
    },
    workers: {
        type: [mongoose_2.Schema.Types.ObjectId],
        ref: "Workers",
    },
    services: {
        type: [mongoose_2.Schema.Types.ObjectId],
        ref: "Services",
    },
    custommers: {
        type: [mongoose_2.Schema.Types.ObjectId],
        ref: "Users",
    },
    workDays: {
        type: [String],
        enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        default: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    },
    businessDaysConfig: serviceConfigDefinition,
    holidaysConfig: serviceConfigDefinition,
    scheduleLimitDays: {
        type: Number,
        default: 30,
        enum: [7, 15, 30],
    },
}, {
    versionKey: false,
    collection: "Barbers",
    timestamps: true,
});
exports.BarbersSchema = BarbersSchema;
BarbersSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });
BarbersSchema.methods.toJSON = function () {
    const barber = this.toObject();
    return barber;
};
BarbersSchema.methods.populateAll =
    function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.populate("avatar");
            yield this.populate("thumbs");
            return this;
        });
    };
BarbersSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const barber = this;
        const condition = barber.workers.length > 0 && barber.services.length > 0;
        if (condition) {
            if (barber.profileStatus === "pre") {
                barber.profileStatus = "completed";
            }
        }
        else {
            if (barber.profileStatus === "completed") {
                barber.profileStatus = "pre";
            }
        }
        next();
    });
});
const BarbersModel = (0, mongoose_1.model)("Barbers", BarbersSchema);
exports.BarbersModel = BarbersModel;
