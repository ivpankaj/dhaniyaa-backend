"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketById = exports.toggleWatch = exports.getTicketsBySprint = exports.deleteTicket = exports.updateTicketStatus = exports.updateTicket = exports.getTicketsByProject = exports.createTicket = void 0;
const ticket_model_1 = require("./ticket.model");
const email_service_1 = require("../../utils/email.service");
const user_model_1 = require("../user/user.model");
const notification_service_1 = require("../notification/notification.service");
const background_jobs_1 = require("../../utils/background-jobs");
const createTicket = async (userId, data) => {
    const ticket = await ticket_model_1.Ticket.create({
        ...data,
        reporter: userId,
        sprintHistory: data.sprintId ? [data.sprintId] : []
    });
    if (ticket.assignee) {
        // Run in background
        background_jobs_1.backgroundJobManager.add('ticket_assignment', { ticketId: ticket._id, assigneeId: ticket.assignee, userId }, async (payload) => {
            const { ticketId, assigneeId, userId } = payload;
            const assignedUser = await user_model_1.User.findById(assigneeId);
            const ticketData = await ticket_model_1.Ticket.findById(ticketId);
            if (assignedUser && ticketData) {
                await (0, email_service_1.sendTicketAssignmentEmail)(assignedUser.email, assignedUser.name, ticketData.title, ticketData.type, ticketData.priority);
                await (0, notification_service_1.createNotification)({
                    recipient: assignedUser._id.toString(),
                    sender: userId,
                    type: 'ticket_assigned',
                    entityType: 'Ticket',
                    entityId: ticketData._id,
                    message: `assigned you to a new ticket: ${ticketData.title}`
                });
            }
        });
    }
    // Notify Creator
    background_jobs_1.backgroundJobManager.add('ticket_creation', { ticketId: ticket._id, userId }, async (payload) => {
        const { ticketId, userId } = payload;
        const creator = await user_model_1.User.findById(userId);
        const ticketData = await ticket_model_1.Ticket.findById(ticketId);
        if (creator && ticketData) {
            await (0, email_service_1.sendTicketCreationEmail)(creator.email, creator.name, ticketData.title, ticketData.type, ticketData.priority);
        }
    });
    return ticket;
};
exports.createTicket = createTicket;
const pagination_1 = require("../../utils/pagination");
const getTicketsByProject = async (projectId, sprintId, options = {}) => {
    const query = { projectId };
    if (sprintId !== undefined) {
        query.sprintId = sprintId;
    }
    return await (0, pagination_1.paginate)(ticket_model_1.Ticket, query, options, [
        { path: 'assignee', select: 'name email avatar' },
        { path: 'reporter', select: 'name email avatar' }
    ]);
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
        background_jobs_1.backgroundJobManager.add('ticket_reassignment', { ticketId: ticket._id, assignee: ticket.assignee, reporter: ticket.reporter }, async (payload) => {
            const { ticketId, assignee, reporter } = payload;
            const assignedUser = assignee; // Already populated in `ticket` but might need to double check if passed object is populated. Safe to use ID if needed.
            // If populated, great. If not, fetch.
            // Strategy: Pass IDs and fetch strictly in job to avoid stale data issues or circular dependency issues with 'populate'.
            // Simplification: Re-fetch user in job.
            const targetUser = await user_model_1.User.findById(assignedUser._id || assignedUser);
            const reporterUser = await user_model_1.User.findById(reporter._id || reporter);
            const currentTicket = await ticket_model_1.Ticket.findById(ticketId);
            if (targetUser && targetUser.email && currentTicket) {
                await (0, email_service_1.sendTicketAssignmentEmail)(targetUser.email, targetUser.name, currentTicket.title, currentTicket.type, currentTicket.priority);
                await (0, notification_service_1.createNotification)({
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
exports.updateTicket = updateTicket;
const updateTicketStatus = async (ticketId, status, userId) => {
    console.log(`[Service] updateTicketStatus called for ticket ${ticketId}, status: ${status}, user: ${userId}`);
    const ticket = await ticket_model_1.Ticket.findByIdAndUpdate(ticketId, { status }, { new: true })
        .populate('assignee', 'name email')
        .populate('reporter', 'name email');
    if (!ticket)
        return null;
    // Run notifications in background queue
    background_jobs_1.backgroundJobManager.add('ticket_status_update', { ticketId: ticket._id, status, userId }, async (payload) => {
        const { ticketId, status, userId } = payload;
        const ticket = await ticket_model_1.Ticket.findById(ticketId).populate('assignee').populate('reporter');
        if (!ticket)
            return;
        try {
            console.log(`[BackgroundJob] Starting notification logic for ticket ${ticket._id} status update`);
            const currentUser = await user_model_1.User.findById(userId);
            const actorName = currentUser?.name || 'Unknown';
            const reporter = ticket.reporter;
            const assignee = ticket.assignee;
            const reporterId = reporter?._id?.toString();
            const assigneeId = assignee?._id?.toString();
            // Notify Reporter
            if (reporterId && reporterId !== userId) { // Don't notify self
                await (0, notification_service_1.createNotification)({
                    recipient: reporterId,
                    sender: userId,
                    type: 'ticket_status_change',
                    entityType: 'Ticket',
                    entityId: ticket._id,
                    message: `updated ticket "${ticket.title}" status to ${status}`
                });
                if (reporter?.email) {
                    try {
                        await (0, email_service_1.sendTicketStatusEmail)(reporter.email, reporter.name, ticket.title, status, actorName);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            // Notify Assignee
            if (assigneeId && assigneeId !== reporterId && assigneeId !== userId) { // Don't notify self or if already notified as reporter
                await (0, notification_service_1.createNotification)({
                    recipient: assigneeId,
                    sender: userId,
                    type: 'ticket_status_change',
                    entityType: 'Ticket',
                    entityId: ticket._id,
                    message: `updated ticket "${ticket.title}" status to ${status}`
                });
                if (assignee?.email) {
                    try {
                        await (0, email_service_1.sendTicketStatusEmail)(assignee.email, assignee.name, ticket.title, status, actorName);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            // Also notify the person who made the change (as specifically requested)
            if (currentUser?.email) {
                try {
                    await (0, email_service_1.sendTicketStatusEmail)(currentUser.email, currentUser.name, ticket.title, status, 'You');
                }
                catch (e) {
                    console.error('Failed to send confirmation email to the actor', e);
                }
            }
        }
        catch (error) {
            console.error('Failed to send status update notification', error);
        }
    });
    return ticket;
};
exports.updateTicketStatus = updateTicketStatus;
const deleteTicket = async (ticketId, userId) => {
    const ticket = await ticket_model_1.Ticket.findById(ticketId).populate('assignee', 'name email');
    if (!ticket)
        return null;
    if (ticket.reporter.toString() !== userId) {
        const error = new Error('Unauthorized: Only the reporter can delete this ticket');
        error.statusCode = 403;
        throw error;
    }
    // Run notifications in background queue
    background_jobs_1.backgroundJobManager.add('ticket_deletion', { ticketId: ticket._id, title: ticket.title, assigneeId: ticket.assignee?._id, assigneeEmail: ticket.assignee?.email, assigneeName: ticket.assignee?.name, userId }, async (payload) => {
        const { ticketId, title, assigneeId, assigneeEmail, assigneeName, userId } = payload;
        try {
            const currentUser = await user_model_1.User.findById(userId);
            const actorName = currentUser?.name || 'Unknown';
            if (assigneeId && assigneeId.toString() !== userId) {
                await (0, notification_service_1.createNotification)({
                    recipient: assigneeId.toString(),
                    sender: userId,
                    type: 'ticket_deleted',
                    entityType: 'Ticket',
                    entityId: ticketId, // Note: Ticket won't exist in DB, but ID reference persists in notification
                    message: `deleted ticket "${title}"`
                });
                if (assigneeEmail) {
                    await (0, email_service_1.sendTicketDeletionEmail)(assigneeEmail, assigneeName, title, actorName);
                }
            }
        }
        catch (e) {
            console.error('Failed to notify assignee about ticket deletion', e);
        }
    });
    return await ticket_model_1.Ticket.findByIdAndDelete(ticketId);
};
exports.deleteTicket = deleteTicket;
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
const toggleWatch = async (ticketId, userId) => {
    const ticket = await ticket_model_1.Ticket.findById(ticketId);
    if (!ticket)
        return null;
    const isWatching = ticket.watchers.some(w => w.toString() === userId);
    if (isWatching) {
        return await ticket_model_1.Ticket.findByIdAndUpdate(ticketId, { $pull: { watchers: userId } }, { new: true });
    }
    else {
        return await ticket_model_1.Ticket.findByIdAndUpdate(ticketId, { $addToSet: { watchers: userId } }, { new: true });
    }
};
exports.toggleWatch = toggleWatch;
const getTicketById = async (ticketId) => {
    return await ticket_model_1.Ticket.findById(ticketId)
        .populate('assignee', 'name email avatar')
        .populate('reporter', 'name email avatar')
        .populate({
        path: 'comments',
        select: 'message createdAt userId attachments',
        populate: { path: 'userId', select: 'name avatar' }
    });
};
exports.getTicketById = getTicketById;
