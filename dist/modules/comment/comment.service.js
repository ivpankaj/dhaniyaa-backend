"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentsByTicket = exports.createComment = void 0;
const comment_model_1 = require("./comment.model");
const ticket_model_1 = require("../ticket/ticket.model");
const createComment = async (userId, data) => {
    const comment = await comment_model_1.Comment.create({
        ...data,
        userId
    });
    // Add comment ref to ticket
    await ticket_model_1.Ticket.findByIdAndUpdate(data.ticketId, {
        $push: { comments: comment._id }
    });
    return await comment.populate('userId', 'name email');
};
exports.createComment = createComment;
const getCommentsByTicket = async (ticketId) => {
    return await comment_model_1.Comment.find({ ticketId })
        .populate('userId', 'name email')
        .sort({ createdAt: 1 });
};
exports.getCommentsByTicket = getCommentsByTicket;
