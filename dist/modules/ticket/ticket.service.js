"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketStatus = exports.updateTicket = exports.getTicketsByProject = exports.createTicket = void 0;
const ticket_model_1 = require("./ticket.model");
const createTicket = async (userId, data) => {
    const ticket = await ticket_model_1.Ticket.create({
        ...data,
        reporter: userId,
    });
    return ticket;
};
exports.createTicket = createTicket;
const getTicketsByProject = async (projectId, sprintId) => {
    const query = { projectId };
    if (sprintId !== undefined) {
        query.sprintId = sprintId;
    }
    return await ticket_model_1.Ticket.find(query)
        .populate('assignee', 'name email')
        .populate('reporter', 'name email')
        .sort({ createdAt: -1 });
};
exports.getTicketsByProject = getTicketsByProject;
const updateTicket = async (ticketId, updates) => {
    return await ticket_model_1.Ticket.findByIdAndUpdate(ticketId, updates, { new: true })
        .populate('assignee', 'name email')
        .populate('reporter', 'name email');
};
exports.updateTicket = updateTicket;
const updateTicketStatus = async (ticketId, status) => {
    return await ticket_model_1.Ticket.findByIdAndUpdate(ticketId, { status }, { new: true });
};
exports.updateTicketStatus = updateTicketStatus;
