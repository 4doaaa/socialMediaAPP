"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.userSchema = exports.RoleEnum = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["MALE"] = "MALE";
    GenderEnum["FEMALE"] = "FEMALE";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["USER"] = "USER";
    RoleEnum["ADMIN"] = "ADMIN";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
exports.userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: [2, "First Name must be at least 2 characters long"],
        maxlength: [20, "First Name must be at most 20 characters long"],
    },
    lastName: {
        type: String,
        required: true,
        minlength: [2, "lastName Name must be at least 2 characters long"],
        maxlength: [20, "lastName Name must be at most 20 characters long"],
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    confirmEmailOTP: String,
    confirmedAt: Date,
    password: {
        type: String,
        required: true,
    },
    resetPasswordOTP: {
        type: String,
    },
    phone: String,
    address: String,
    gender: {
        type: String,
        enum: Object.values(GenderEnum),
        default: GenderEnum.MALE,
    },
    role: {
        type: String,
        enum: Object.values(RoleEnum),
        default: RoleEnum.USER,
    },
}, { timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.userSchema.virtual("messages", {
    localField: "_id",
    foreignField: "receiverId",
    ref: "Message",
});
exports.userSchema.virtual("username").set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
}).get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", exports.userSchema);
