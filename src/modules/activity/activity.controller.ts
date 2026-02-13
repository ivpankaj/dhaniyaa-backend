import { Request, Response, NextFunction } from 'express';
import * as activityService from './activity.service';

export const getByEntity = async (req: any, res: Response, next: NextFunction) => {
    try {
        const activities = await activityService.getActivitiesByEntity(req.params.entityId as string);
        res.status(200).json({ success: true, data: activities });
    } catch (error) {
        next(error);
    }
};
