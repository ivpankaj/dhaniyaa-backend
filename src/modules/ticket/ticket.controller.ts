import { Request, Response, NextFunction } from 'express';
import * as ticketService from './ticket.service';
import * as activityService from '../activity/activity.service';
import { TicketStatus } from './ticket.model';

export const create = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (req.body.assignee && String(req.body.assignee) === String(req.user!._id)) {
            return res.status(400).json({ success: false, message: 'You cannot assign a task to yourself' });
        }
        const ticket = await ticketService.createTicket(req.user!._id.toString(), req.body);
        // Emit socket event
        const io = req.app.get('io');
        io.to(req.body.projectId).emit('ticket_created', ticket);

        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

export const getByProject = async (req: any, res: Response, next: NextFunction) => {
    try {
        const projectId = req.query.projectId as string;
        const sprintId = req.query.sprintId as string | undefined;
        // Ensure projectId is a string
        if (typeof projectId !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid projectId' });
            return;
        }

        const tickets = await ticketService.getTicketsByProject(projectId, sprintId, {
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 50,
            sortBy: (req.query.sortBy as string) || 'createdAt',
            sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
        });
        res.status(200).json({ success: true, ...tickets });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (req.body.assignee && String(req.body.assignee) === String(req.user!._id)) {
            return res.status(400).json({ success: false, message: 'You cannot assign a task to yourself' });
        }
        const ticket = await ticketService.updateTicket(req.params.id as string, req.body);

        // Emit socket event
        if (ticket) {
            const io = req.app.get('io');
            io.to(ticket.projectId.toString()).emit('ticket_updated', ticket);
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

export const updateStatus = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        const ticket = await ticketService.updateTicketStatus(req.params.id as string, status as TicketStatus, req.user!._id.toString());
        console.log(`[Controller] Ticket status updated, awaiting background tasks triggered in service.`);

        if (ticket) {
            const io = req.app.get('io');
            io.to(ticket.projectId.toString()).emit('ticket_updated', ticket);

            // Log Activity
            await activityService.createActivity({
                entityType: 'Ticket',
                entityId: ticket._id,
                userId: req.user!._id,
                action: 'moved',
                details: `changed status to ${status}`
            });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
}

export const getBySprint = async (req: any, res: Response, next: NextFunction) => {
    try {
        const tickets = await ticketService.getTicketsBySprint(req.params.sprintId as string);
        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        next(error);
    }
};
export const deleteTicket = async (req: any, res: Response, next: NextFunction) => {
    try {
        const ticket = await ticketService.deleteTicket(req.params.id as string, req.user!._id.toString());
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found or unauthorized' });
        }
        res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const toggleWatch = async (req: any, res: Response, next: NextFunction) => {
    try {
        const ticket = await ticketService.toggleWatch(req.params.id as string, req.user!._id.toString());
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

export const getById = async (req: any, res: Response, next: NextFunction) => {
    try {
        const ticket = await ticketService.getTicketById(req.params.id as string);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};
