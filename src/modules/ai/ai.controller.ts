import { Request, Response, NextFunction } from 'express';
import * as aiService from './ai.service';

export const chatWithAdrak = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const response = await aiService.getAdrakResponse(message, history || []);

        res.status(200).json({
            success: true,
            data: {
                response
            }
        });
    } catch (error) {
        next(error);
    }
};
