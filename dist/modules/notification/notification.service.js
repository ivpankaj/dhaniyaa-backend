"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getUserNotifications = exports.createNotification = void 0;
const notification_model_1 = require("./notification.model");
const createNotification = async (data) => {
    const notification = await notification_model_1.Notification.create(data);
    return await notification.populate('sender', 'name email');
};
exports.createNotification = createNotification;
const getUserNotifications = async (userId) => {
    return await notification_model_1.Notification.find({ recipient: userId })
        .populate('sender', 'name email')
        .sort({ createdAt: -1 })
        .limit(20);
};
exports.getUserNotifications = getUserNotifications;
const markAsRead = async (notificationId, userId) => {
    return await notification_model_1.Notification.findOneAndUpdate({ _id: notificationId, recipient: userId }, { isRead: true }, { new: true });
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (userId) => {
    return await notification_model_1.Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};
exports.markAllAsRead = markAllAsRead;
