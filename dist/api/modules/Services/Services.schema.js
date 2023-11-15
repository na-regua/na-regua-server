"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesSchema = exports.ServicesModel = void 0;
const mongoose_1 = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const ServicesSchema = new mongoose_1.Schema({
    barber: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Barbers",
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    durationInMinutes: {
        type: Number,
        required: true,
        min: 0,
    },
    icon: {
        type: String,
        enum: ["navalha", "maquina", "pente"],
        required: true,
    },
}, {
    versionKey: false,
    timestamps: true,
    collection: "Services",
});
exports.ServicesSchema = ServicesSchema;
ServicesSchema.plugin(uniqueValidator, { message: "{PATH} já está em uso." });
ServicesSchema.methods.toJSON = function () {
    const _a = this.toObject(), { barber } = _a, service = __rest(_a, ["barber"]);
    return Object.assign(Object.assign({}, service), { barberId: barber._id });
};
const ServicesModel = (0, mongoose_1.model)("Services", ServicesSchema);
exports.ServicesModel = ServicesModel;