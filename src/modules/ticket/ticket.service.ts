import { Ticket, ITicket, TicketStatus } from './ticket.model';
import { sendTicketAssignmentEmail, sendTicketStatusEmail, sendTicketDeletionEmail } from '../../utils/email.service';
import { User } from '../user/user.model';
import { createNotification } from '../notification/notification.service';
import { backgroundJobManager } from '../../utils/background-jobs';

export const createTicket = async (userId: string, data: Partial<ITicket>) => {
    const ticket = await Ticket.create({
        ...data,
        reporter: userId,
        sprintHistory: data.sprintId ? [data.sprintId] : []
    });

    if (ticket.assignee) {
        // Run in background
        backgroundJobManager.add('ticket_assignment', { ticketId: ticket._id, assigneeId: ticket.assignee, userId }, async (payload) => {
            const { ticketId, assigneeId, userId } = payload;
            const assignedUser = await User.findById(assigneeId);
            const ticket = await Ticket.findById(ticketId); // Re-fetch to ensure fresh data if needed, or pass data. Ticket object might be stale if modified quickly

            if (assignedUser && ticket) {
                await sendTicketAssignmentEmail(
                    assignedUser.email,
                    assignedUser.name,
                    ticket.title,
                    ticket.type,
                    ticket.priority
                );

                await createNotification({
                    recipient: assignedUser._id.toString(),
                    sender: userId,
                    type: 'ticket_assigned',
                    entityType: 'Ticket',
                    entityId: ticket._id,
                    message: `assigned you to a new ticket: ${ticket.title}`
                });
            }
        });
    }

    return ticket;
};

import { paginate, PaginationOptions } from '../../utils/pagination';

export const getTicketsByProject = async (projectId: string, sprintId?: string | undefined, options: PaginationOptions = {}) => {
    const query: any = { projectId };
    if (sprintId !== undefined) {
        query.sprintId = sprintId;
    }

    return await paginate(Ticket, query, options, [
        { path: 'assignee', select: 'name email avatar' },
        { path: 'reporter', select: 'name email avatar' }
    ]);
};

export const updateTicket = async (ticketId: string, updates: Partial<ITicket>) => {
    const oldTicket = await Ticket.findById(ticketId);
    const ticket = await Ticket.findByIdAndUpdate(ticketId, updates, { new: true })
        .populate('assignee', 'name email avatar')
        .populate('reporter', 'name email avatar');

    if (ticket && updates.sprintId && updates.sprintId.toString() !== oldTicket?.sprintId?.toString()) {
        await Ticket.findByIdAndUpdate(ticketId, {
            $addToSet: { sprintHistory: updates.sprintId }
        });
    }

    if (ticket && updates.assignee && updates.assignee.toString() !== oldTicket?.assignee?.toString()) {
        backgroundJobManager.add('ticket_reassignment', { ticketId: ticket._id, assignee: ticket.assignee, reporter: ticket.reporter }, async (payload) => {
            const { ticketId, assignee, reporter } = payload;
            const assignedUser = assignee as any; // Already populated in `ticket` but might need to double check if passed object is populated. Safe to use ID if needed.
            // If populated, great. If not, fetch.
            // Strategy: Pass IDs and fetch strictly in job to avoid stale data issues or circular dependency issues with 'populate'.
            // Simplification: Re-fetch user in job.

            const targetUser = await User.findById(assignedUser._id || assignedUser);
            const reporterUser = await User.findById(reporter._id || reporter);
            const currentTicket = await Ticket.findById(ticketId);

            if (targetUser && targetUser.email && currentTicket) {
                await sendTicketAssignmentEmail(
                    targetUser.email,
                    targetUser.name,
                    currentTicket.title,
                    currentTicket.type,
                    currentTicket.priority
                );

                await createNotification({
                    recipient: targetUser._id.toString(),
                    sender: reporterUser?._id.toString() || 'system',
                    type: 'ticket_assigned',
                    entityType: 'Ticket',
                    entityId: currentTicket._id,
                    message: `re-assigned you to a ticket: ${currentTicket.title}`
                });
            }
        });
    }

    return ticket;
};

export const updateTicketStatus = async (ticketId: string, status: TicketStatus, userId: string) => {
    console.log(`[Service] updateTicketStatus called for ticket ${ticketId}, status: ${status}, user: ${userId}`);
    const ticket = await Ticket.findByIdAndUpdate(ticketId, { status }, { new: true })
        .populate('assignee', 'name email')
        .populate('reporter', 'name email');

    if (!ticket) return null;

    // Run notifications in background queue
    backgroundJobManager.add('ticket_status_update', { ticketId: ticket._id, status, userId }, async (payload) => {
        const { ticketId, status, userId } = payload;
        const ticket = await Ticket.findById(ticketId).populate('assignee').populate('reporter');
        if (!ticket) return;

        try {
            console.log(`[BackgroundJob] Starting notification logic for ticket ${ticket._id} status update`);
            const currentUser = await User.findById(userId);
            const actorName = currentUser?.name || 'Unknown';

            const reporter = ticket.reporter as any;
            const assignee = ticket.assignee as any;
            const reporterId = reporter?._id?.toString();
            const assigneeId = assignee?._id?.toString();

            // Notify Reporter
            if (reporterId && reporterId !== userId) { // Don't notify self
                await createNotification({
                    recipient: reporterId,
                    sender: userId,
                    type: 'ticket_status_change',
                    entityType: 'Ticket',
                    entityId: ticket._id,
                    message: `updated ticket "${ticket.title}" status to ${status}`
                });
                if (reporter?.email) {
                    try {
                        await sendTicketStatusEmail(reporter.email, reporter.name, ticket.title, status, actorName);
                    } catch (e) { console.error(e); }
                }
            }

            // Notify Assignee
            if (assigneeId && assigneeId !== reporterId && assigneeId !== userId) { // Don't notify self or if already notified as reporter
                await createNotification({
                    recipient: assigneeId,
                    sender: userId,
                    type: 'ticket_status_change',
                    entityType: 'Ticket',
                    entityId: ticket._id,
                    message: `updated ticket "${ticket.title}" status to ${status}`
                });
                if (assignee?.email) {
                    try {
                        await sendTicketStatusEmail(assignee.email, assignee.name, ticket.title, status, actorName);
                    } catch (e) { console.error(e); }
                }
            }
        } catch (error) {
            console.error('Failed to send status update notification', error);
        }
    });

    return ticket;
};

export const deleteTicket = async (ticketId: string, userId: string) => {
    const ticket = await Ticket.findById(ticketId).populate('assignee', 'name email');
    if (!ticket) return null;

    if (ticket.reporter.toString() !== userId) {
        const error: any = new Error('Unauthorized: Only the reporter can delete this ticket');
        error.statusCode = 403;
        throw error;
    }

    // Run notifications in background queue
    backgroundJobManager.add('ticket_deletion', { ticketId: ticket._id, title: ticket.title, assigneeId: (ticket.assignee as any)?._id, assigneeEmail: (ticket.assignee as any)?.email, assigneeName: (ticket.assignee as any)?.name, userId }, async (payload) => {
        const { ticketId, title, assigneeId, assigneeEmail, assigneeName, userId } = payload;
        try {
            const currentUser = await User.findById(userId);
            const actorName = currentUser?.name || 'Unknown';

            if (assigneeId && assigneeId.toString() !== userId) {
                await createNotification({
                    recipient: assigneeId.toString(),
                    sender: userId,
                    type: 'ticket_deleted',
                    entityType: 'Ticket',
                    entityId: ticketId, // Note: Ticket won't exist in DB, but ID reference persists in notification
                    message: `deleted ticket "${title}"`
                });
                if (assigneeEmail) {
                    await sendTicketDeletionEmail(assigneeEmail, assigneeName, title, actorName);
                }
            }
        } catch (e) {
            console.error('Failed to notify assignee about ticket deletion', e);
        }
    });

    return await Ticket.findByIdAndDelete(ticketId);
};

export const getTicketsBySprint = async (sprintId: string) => {
    return await Ticket.find({
        $or: [
            { sprintId },
            { sprintHistory: sprintId }
        ]
    })
        .populate('assignee', 'name email avatar')
        .populate('reporter', 'name email avatar')
        .sort({ status: 1 });
};



export const toggleWatch = async (ticketId: string, userId: string) => {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return null;

    const isWatching = ticket.watchers.some(w => w.toString() === userId);

    if (isWatching) {
        return await Ticket.findByIdAndUpdate(ticketId, { $pull: { watchers: userId } }, { new: true });
    } else {
        return await Ticket.findByIdAndUpdate(ticketId, { $addToSet: { watchers: userId } }, { new: true });
    }
};

export const getTicketById = async (ticketId: string) => {
    return await Ticket.findById(ticketId)
        .populate('assignee', 'name email avatar')
        .populate('reporter', 'name email avatar')
        .populate({
            path: 'comments',
            select: 'message createdAt userId attachments',
            populate: { path: 'userId', select: 'name avatar' }
        });
};
