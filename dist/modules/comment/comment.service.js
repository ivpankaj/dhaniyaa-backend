"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentsByTicket = exports.createComment = void 0;
const comment_model_1 = require("./comment.model");
const ticket_model_1 = require("../ticket/ticket.model");
const notification_service_1 = require("../notification/notification.service");
const createComment = async (userId, data) => {
    const comment = await comment_model_1.Comment.create({
        ...data,
        userId
    });
    // Add comment ref to ticket and get the ticket to know the projectId
    const ticket = await ticket_model_1.Ticket.findByIdAndUpdate(data.ticketId, {
        $push: { comments: comment._id }
    }, { new: true });
    // Notify assignee and reporter (if they are not the one commenting)
    if (ticket) {
        const recipients = new Set();
        if (ticket.assignee && ticket.assignee.toString() !== userId)
            recipients.add(ticket.assignee.toString());
        if (ticket.reporter && ticket.reporter.toString() !== userId)
            recipients.add(ticket.reporter.toString());
        for (const recipientId of recipients) {
            await (0, notification_service_1.createNotification)({
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
exports.createComment = createComment;
const getCommentsByTicket = async (ticketId) => {
    return await comment_model_1.Comment.find({ ticketId })
        .populate('userId', 'name email avatar')
        .sort({ createdAt: 1 });
};
exports.getCommentsByTicket = getCommentsByTicket;
