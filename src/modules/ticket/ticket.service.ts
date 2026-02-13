import { Ticket, ITicket, TicketStatus } from './ticket.model';
import { sendTicketAssignmentEmail } from '../../utils/email.service';
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

export const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    return await Ticket.findByIdAndUpdate(ticketId, { status }, { new: true });
}

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
