"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketsBySprint = exports.updateTicketStatus = exports.updateTicket = exports.getTicketsByProject = exports.createTicket = void 0;
const ticket_model_1 = require("./ticket.model");
const email_service_1 = require("../../utils/email.service");
const user_model_1 = require("../user/user.model");
const notification_service_1 = require("../notification/notification.service");
const createTicket = async (userId, data) => {
    const ticket = await ticket_model_1.Ticket.create({
        ...data,
        reporter: userId,
        sprintHistory: data.sprintId ? [data.sprintId] : []
    });
    if (ticket.assignee) {
        const assignedUser = await user_model_1.User.findById(ticket.assignee);
        if (assignedUser) {
            // Email
            await (0, email_service_1.sendTicketAssignmentEmail)(assignedUser.email, assignedUser.name, ticket.title, ticket.type, ticket.priority);
            await (0, notification_service_1.createNotification)({
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
exports.createTicket = createTicket;
const getTicketsByProject = async (projectId, sprintId) => {
    const query = { projectId };
    if (sprintId !== undefined) {
        query.sprintId = sprintId;
    }
    return await ticket_model_1.Ticket.find(query)
        .populate('assignee', 'name email avatar')
        .populate('reporter', 'name email avatar')
        .sort({ createdAt: -1 });
};
exports.getTicketsByProject = getTicketsByProject;
const updateTicket = async (ticketId, updates) => {
    const oldTicket = await ticket_model_1.Ticket.findById(ticketId);
    const ticket = await ticket_model_1.Ticket.findByIdAndUpdate(ticketId, updates, { new: true })
        .populate('assignee', 'name email avatar')
        .populate('reporter', 'name email avatar');
    if (ticket && updates.sprintId && updates.sprintId.toString() !== oldTicket?.sprintId?.toString()) {
        await ticket_model_1.Ticket.findByIdAndUpdate(ticketId, {
            $addToSet: { sprintHistory: updates.sprintId }
        });
    }
    if (ticket && updates.assignee && updates.assignee.toString() !== oldTicket?.assignee?.toString()) {
        const assignedUser = ticket.assignee; // Populated
        if (assignedUser && assignedUser.email) {
            // Email
            await (0, email_service_1.sendTicketAssignmentEmail)(assignedUser.email, assignedUser.name, ticket.title, ticket.type, ticket.priority);
            await (0, notification_service_1.createNotification)({
                recipient: assignedUser._id.toString(),
                sender: ticket.reporter?._id?.toString() || ticket.reporter,
                type: 'ticket_assigned',
                entityType: 'Ticket',
                entityId: ticket._id,
                message: `re-assigned you to a ticket: ${ticket.title}`
            });
        }
    }
    return ticket;
};
exports.updateTicket = updateTicket;
const updateTicketStatus = async (ticketId, status) => {
    return await ticket_model_1.Ticket.findByIdAndUpdate(ticketId, { status }, { new: true });
};
exports.updateTicketStatus = updateTicketStatus;
const getTicketsBySprint = async (sprintId) => {
    return await ticket_model_1.Ticket.find({
        $or: [
            { sprintId },
            { sprintHistory: sprintId }
        ]
    })
        .populate('assignee', 'name email avatar')
        .populate('reporter', 'name email avatar')
        .sort({ status: 1 });
};
exports.getTicketsBySprint = getTicketsBySprint;
