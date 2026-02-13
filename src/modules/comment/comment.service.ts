import { Comment as CommentModel } from './comment.model';
import { Ticket } from '../ticket/ticket.model';
import { createNotification } from '../notification/notification.service';

export const createComment = async (userId: string, data: { ticketId: string; message: string; attachments?: string[] }) => {
    const comment = await CommentModel.create({
        ...data,
        userId
    });

    // Add comment ref to ticket and get the ticket to know the projectId
    const ticket = await Ticket.findByIdAndUpdate(data.ticketId, {
        $push: { comments: comment._id }
    }, { new: true });

    // Notify assignee and reporter (if they are not the one commenting)
    if (ticket) {
        const recipients = new Set<string>();
        if (ticket.assignee && ticket.assignee.toString() !== userId) recipients.add(ticket.assignee.toString());
        if (ticket.reporter && ticket.reporter.toString() !== userId) recipients.add(ticket.reporter.toString());

        for (const recipientId of recipients) {
            await createNotification({
                recipient: recipientId,
                sender: userId,
                type: 'comment_added',
                entityType: 'Ticket',
                entityId: ticket._id,
                message: `commented on ticket: ${ticket.title}`
            });
        }
    }

    const populated = await comment.populate('userId', 'name email avatar');
    return { comment: populated, projectId: ticket?.projectId };
};

export const getCommentsByTicket = async (ticketId: string) => {
    return await CommentModel.find({ ticketId })
        .populate('userId', 'name email avatar')
        .sort({ createdAt: 1 });
};
