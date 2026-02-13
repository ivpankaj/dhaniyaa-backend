import { Notification, INotification } from './notification.model';

export const createNotification = async (data: any) => {
    const notification = await Notification.create(data as any);
    return await notification.populate('sender', 'name email');
};

export const getUserNotifications = async (userId: string) => {
    return await Notification.find({ recipient: userId })
        .populate('sender', 'name email')
        .sort({ createdAt: -1 })
        .limit(20);
};

export const markAsRead = async (notificationId: string, userId: string) => {
    return await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true },
        { new: true }
    );
};

export const markAllAsRead = async (userId: string) => {
    return await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
    );
};
