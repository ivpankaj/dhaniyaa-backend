"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getUserNotifications = exports.createNotification = void 0;
const notification_model_1 = require("./notification.model");
const socket_1 = require("../../socket");
const createNotification = async (data) => {
    try {
        console.log(`[Notification] Creating notification for: ${data.recipient}, type: ${data.type}`);
        const notification = await notification_model_1.Notification.create(data);
        const populated = await notification.populate('sender', 'name email');
        try {
            const io = (0, socket_1.getIO)();
            console.log(`[Notification] Emitting to socket room: ${data.recipient}`);
            io.to(data.recipient).emit('notification', populated);
        }
        catch (err) {
            console.warn('Socket not initialized or failed to emit notification', err);
        }
        return populated;
    }
    catch (error) {
        console.error('[Notification] Error creating notification:', error);
        throw error;
    }
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
