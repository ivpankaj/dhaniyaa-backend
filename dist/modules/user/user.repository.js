"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByResetToken = exports.findById = exports.create = exports.findByEmail = void 0;
const user_model_1 = require("./user.model");
const findByEmail = async (email) => {
    return await user_model_1.User.findOne({ email });
};
exports.findByEmail = findByEmail;
const create = async (data) => {
    return await user_model_1.User.create(data);
};
exports.create = create;
const findById = async (id) => {
    return await user_model_1.User.findById(id);
};
exports.findById = findById;
const findByResetToken = async (resetPasswordToken) => {
    return await user_model_1.User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
};
exports.findByResetToken = findByResetToken;
