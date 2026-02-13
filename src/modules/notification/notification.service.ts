import { Notification, INotification } from './notification.model';
import { getIO } from '../../socket';

export const createNotification = async (data: any) => {
    try {
        console.log(`[Notification] Creating notification for: ${data.recipient}, type: ${data.type}`);
        const notification = await Notification.create(data as any);
        const populated = await notification.populate('sender', 'name email');

        try {
            const io = getIO();
            console.log(`[Notification] Emitting to socket room: ${data.recipient}`);
            io.to(data.recipient).emit('notification', populated);
        } catch (err) {
            console.warn('Socket not initialized or failed to emit notification', err);
        }

        return populated;
    } catch (error) {
        console.error('[Notification] Error creating notification:', error);
        throw error;
    }
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
