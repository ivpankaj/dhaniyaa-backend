import { Request, Response, NextFunction } from 'express';
import * as commentService from './comment.service';

export const create = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { comment, projectId } = await commentService.createComment(req.user!._id.toString(), req.body);

        // Emit socket event for real-time updates
        if (projectId) {
            const io = req.app.get('io');
            io.to(projectId.toString()).emit('comment_created', comment);
        }

        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        next(error);
    }
};

export const getByTicket = async (req: any, res: Response, next: NextFunction) => {
    try {
        const comments = await commentService.getCommentsByTicket(req.params.ticketId as string);
        res.status(200).json({ success: true, data: comments });
    } catch (error) {
        next(error);
    }
};
