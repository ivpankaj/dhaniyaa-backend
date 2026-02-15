"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeSprint = exports.updateSprint = exports.deleteSprint = exports.getSprintsByProject = exports.createSprint = void 0;
const sprint_model_1 = require("./sprint.model");
const ticket_model_1 = require("../ticket/ticket.model");
const project_model_1 = require("../project/project.model");
const user_model_1 = require("../user/user.model");
const notification_service_1 = require("../notification/notification.service");
const email_service_1 = require("../../utils/email.service");
const createSprint = async (userId, data) => {
    const sprint = await sprint_model_1.Sprint.create({ ...data, createdBy: userId });
    // Notify Project Members in Background
    (async () => {
        try {
            const project = await project_model_1.Project.findById(data.projectId).populate('members.userId');
            const currentUser = await user_model_1.User.findById(userId);
            const actionBy = currentUser?.name || 'Unknown';
            if (project) {
                for (const member of project.members) {
                    const memberUser = member.userId;
                    if (!memberUser)
                        continue;
                    const memberId = memberUser._id?.toString() || memberUser.toString();
                    if (memberId !== userId) {
                        await (0, notification_service_1.createNotification)({
                            recipient: memberId,
                            sender: userId,
                            type: 'sprint_created',
                            entityType: 'Sprint',
                            entityId: sprint._id,
                            message: `created a new cycle "${sprint.name}" in project ${project.name}`
                        });
                        if (memberUser.email) {
                            await (0, email_service_1.sendSprintNotificationEmail)(memberUser.email, memberUser.name, sprint.name, 'created', actionBy);
                        }
                    }
                }
            }
        }
        catch (e) {
            console.error('Failed to notify project members for sprint creation', e);
        }
    })();
    return sprint;
};
exports.createSprint = createSprint;
const getSprintsByProject = async (projectId) => {
    return await sprint_model_1.Sprint.find({ projectId })
        .populate('createdBy', 'name email avatar')
        .sort({ startDate: 1 });
};
exports.getSprintsByProject = getSprintsByProject;
const deleteSprint = async (sprintId, userId) => {
    const sprint = await sprint_model_1.Sprint.findById(sprintId);
    if (!sprint)
        return null;
    // Verify auth
    if (sprint.createdBy.toString() !== userId) {
        throw new Error('Unauthorized: Only the creator can delete this cycle');
    }
    // Notify in background
    (async () => {
        try {
            const project = await project_model_1.Project.findById(sprint.projectId).populate('members.userId');
            const currentUser = await user_model_1.User.findById(userId);
            const actionBy = currentUser?.name || 'Unknown';
            if (project) {
                for (const member of project.members) {
                    const memberUser = member.userId;
                    if (!memberUser)
                        continue;
                    const memberId = memberUser._id?.toString() || memberUser.toString();
                    if (memberId !== userId) {
                        await (0, notification_service_1.createNotification)({
                            recipient: memberId,
                            sender: userId,
                            type: 'sprint_deleted',
                            entityType: 'Sprint',
                            entityId: sprint._id,
                            message: `deleted cycle "${sprint.name}"`
                        });
                        if (memberUser.email) {
                            await (0, email_service_1.sendSprintNotificationEmail)(memberUser.email, memberUser.name, sprint.name, 'deleted', actionBy);
                        }
                    }
                }
            }
        }
        catch (e) {
            console.error('Failed to notify for sprint deletion', e);
        }
    })();
    // Move all tickets in this sprint to backlog
    await ticket_model_1.Ticket.updateMany({ sprintId }, { sprintId: null });
    return await sprint_model_1.Sprint.findByIdAndDelete(sprintId);
};
exports.deleteSprint = deleteSprint;
const updateSprint = async (sprintId, updates) => {
    return await sprint_model_1.Sprint.findByIdAndUpdate(sprintId, updates, { new: true });
};
exports.updateSprint = updateSprint;
const completeSprint = async (sprintId, userId) => {
    // Get ticket counts for summary
    const totalTickets = await ticket_model_1.Ticket.countDocuments({ sprintId });
    const completedTickets = await ticket_model_1.Ticket.countDocuments({ sprintId, status: 'Done' });
    const pushedBackTickets = totalTickets - completedTickets;
    const sprint = await sprint_model_1.Sprint.findByIdAndUpdate(sprintId, {
        status: 'COMPLETED',
        summary: {
            totalTickets,
            completedTickets,
            pushedBackTickets
        }
    }, { new: true });
    if (!sprint)
        throw new Error('Cycle not found');
    // Move incomplete tickets back to backlog
    await ticket_model_1.Ticket.updateMany({ sprintId, status: { $ne: 'Done' } }, { sprintId: null });
    // Notify in background
    (async () => {
        try {
            const project = await project_model_1.Project.findById(sprint.projectId).populate('members.userId');
            const currentUser = await user_model_1.User.findById(userId);
            const actionBy = currentUser?.name || 'Unknown';
            if (project) {
                for (const member of project.members) {
                    const memberUser = member.userId;
                    if (!memberUser)
                        continue;
                    const memberId = memberUser._id?.toString() || memberUser.toString();
                    if (memberId !== userId) {
                        await (0, notification_service_1.createNotification)({
                            recipient: memberId,
                            sender: userId,
                            type: 'sprint_completed',
                            entityType: 'Sprint',
                            entityId: sprint._id,
                            message: `completed cycle "${sprint.name}"`
                        });
                        if (memberUser.email) {
                            await (0, email_service_1.sendSprintNotificationEmail)(memberUser.email, memberUser.name, sprint.name, 'completed', actionBy);
                        }
                    }
                }
            }
        }
        catch (e) {
            console.error('Failed to notify for sprint completion', e);
        }
    })();
    return sprint;
};
exports.completeSprint = completeSprint;
