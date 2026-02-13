import { Ticket, ITicket, TicketStatus } from './ticket.model';
import { sendTicketAssignmentEmail, sendTicketStatusEmail, sendTicketDeletionEmail } from '../../utils/email.service';
import { User } from '../user/user.model';
import { createNotification } from '../notification/notification.service';

export const createTicket = async (userId: string, data: Partial<ITicket>) => {
    const ticket = await Ticket.create({
        ...data,
        reporter: userId,
        sprintHistory: data.sprintId ? [data.sprintId] : []
    });

    if (ticket.assignee) {
        const assignedUser = await User.findById(ticket.assignee);
        if (assignedUser) {
            // Email
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
    }

    return ticket;
};

export const getTicketsByProject = async (projectId: string, sprintId?: string | undefined) => {
    const query: any = { projectId };
    if (sprintId !== undefined) {
        query.sprintId = sprintId;
    }
    return await Ticket.find(query)
        .populate('assignee', 'name email avatar')
        .populate('reporter', 'name email avatar')
        .sort({ createdAt: -1 });
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
        const assignedUser = ticket.assignee as any; // Populated
        if (assignedUser && assignedUser.email) {
            // Email
            await sendTicketAssignmentEmail(
                assignedUser.email,
                assignedUser.name,
                ticket.title,
                ticket.type,
                ticket.priority
            );

            await createNotification({
                recipient: assignedUser._id.toString(),
                sender: (ticket.reporter as any)?._id?.toString() || (ticket.reporter as any),
                type: 'ticket_assigned',
                entityType: 'Ticket',
                entityId: ticket._id,
                message: `re-assigned you to a ticket: ${ticket.title}`
            });
        }
    }

    return ticket;
};

export const updateTicketStatus = async (ticketId: string, status: TicketStatus, userId: string) => {
    console.log(`[Service] updateTicketStatus called for ticket ${ticketId}, status: ${status}, user: ${userId}`);
    const oldTicket = await Ticket.findById(ticketId);
    const ticket = await Ticket.findByIdAndUpdate(ticketId, { status }, { new: true })
        .populate('assignee', 'name email')
        .populate('reporter', 'name email');


    if (!ticket) return null;

    // Run notifications in background
    (async () => {
        try {
            console.log(`[Background] Starting notification logic for ticket ${ticket._id} status update`);
            const currentUser = await User.findById(userId);
            const actorName = currentUser?.name || 'Unknown';

            const reporter = ticket.reporter as any;
            const assignee = ticket.assignee as any;

            // Helper to safely get ID
            const getId = (doc: any) => doc?._id?.toString() || doc?.toString();

            const reporterId = getId(reporter);
            const assigneeId = getId(assignee);

            console.log('--- Ticket Status Update Notification Debug ---');
            console.log(`Ticket ID: ${ticket._id}`);
            console.log(`Actor ID: ${userId} (${actorName})`);
            console.log(`Reporter ID: ${reporterId} (${reporter?.name})`);
            console.log(`Assignee ID: ${assigneeId} (${assignee?.name})`);
            console.log(`Should Notify Assigne?: ${assigneeId && assigneeId !== userId && assigneeId !== reporterId}`);
            console.log('---------------------------------------------');

            // Notify Reporter
            if (reporterId) {
                console.log('Notifying Reporter...');
                await createNotification({
                    recipient: reporterId,
                    sender: userId,
                    type: 'ticket_status_change',
                    entityType: 'Ticket',
                    entityId: ticket._id,
                    message: `updated ticket "${ticket.title}" status to ${status}`
                });
                if (reporter?.email) {
                    console.log(`[Email] Sending status update email to reporter: ${reporter.email}`);
                    try {
                        await sendTicketStatusEmail(reporter.email, reporter.name, ticket.title, status, actorName);
                        console.log(`[Email] Successfully sent email to reporter: ${reporter.email}`);
                    } catch (emailErr: any) {
                        console.error(`[Email] Failed to send email to reporter: ${reporter.email}`, emailErr);
                    }
                } else {
                    console.warn(`[Email] Reporter has no email address: ${reporterId}`);
                }
            } else {
                console.log('Reporter is undefined, skipping notification.');
            }

            // Notify Assignee
            // Notify Assignee
            if (assigneeId && assigneeId !== reporterId) {
                console.log('Notifying Assignee...');
                await createNotification({
                    recipient: assigneeId,
                    sender: userId,
                    type: 'ticket_status_change',
                    entityType: 'Ticket',
                    entityId: ticket._id,
                    message: `updated ticket "${ticket.title}" status to ${status}`
                });
                if (assignee?.email) {
                    console.log(`[Email] Sending status update email to assignee: ${assignee.email}`);
                    try {
                        await sendTicketStatusEmail(assignee.email, assignee.name, ticket.title, status, actorName);
                        console.log(`[Email] Successfully sent email to assignee: ${assignee.email}`);
                    } catch (emailErr: any) {
                        console.error(`[Email] Failed to send email to assignee: ${assignee.email}`, emailErr);
                    }
                } else {
                    console.warn(`[Email] Assignee has no email address: ${assigneeId}`);
                }
            } else {
                console.log('Assignee is same as actor or reporter, skipping notification.');
            }

        } catch (error) {
            console.error('Failed to send status update notification', error);
        }
    })();

    return ticket;
};


export const deleteTicket = async (ticketId: string, userId: string) => {
    const ticket = await Ticket.findById(ticketId).populate('assignee', 'name email');
    if (!ticket) return null;

    console.log(`[deleteTicket] Reporter: ${ticket.reporter}, User: ${userId}`);

    if (ticket.reporter.toString() !== userId) {
        const error: any = new Error('Unauthorized: Only the reporter can delete this ticket');
        error.statusCode = 403;
        throw error;
    }

    // Run notifications in background
    (async () => {
        try {
            const currentUser = await User.findById(userId);
            const actorName = currentUser?.name || 'Unknown';

            // Notify Assignee
            const assignee = ticket.assignee as any;
            if (assignee && assignee._id.toString() !== userId) {
                await createNotification({
                    recipient: assignee._id.toString(),
                    sender: userId,
                    type: 'ticket_deleted', // Ensure frontend handles or defaults this
                    entityType: 'Ticket',
                    entityId: ticket._id,
                    message: `deleted ticket "${ticket.title}"`
                });
                if (assignee.email) {
                    await sendTicketDeletionEmail(assignee.email, assignee.name, ticket.title, actorName);
                }
            }
        } catch (e) {
            console.error('Failed to notify assignee about ticket deletion', e);
        }
    })();

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
