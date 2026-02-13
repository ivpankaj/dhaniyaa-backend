import { Request, Response, NextFunction } from 'express';
import * as notificationService from './notification.service';

export const getMine = async (req: any, res: Response, next: NextFunction) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user!._id.toString());
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
};

export const markRead = async (req: any, res: Response, next: NextFunction) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id as string, req.user!._id.toString());
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

export const markAllRead = async (req: any, res: Response, next: NextFunction) => {
    try {
        await notificationService.markAllAsRead(req.user!._id.toString());
        res.status(200).json({ success: true, message: 'All marked as read' });
    } catch (error) {
        next(error);
    }
};
