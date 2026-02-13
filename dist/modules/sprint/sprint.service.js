"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeSprint = exports.updateSprint = exports.getSprintsByProject = exports.createSprint = void 0;
const sprint_model_1 = require("./sprint.model");
const ticket_model_1 = require("../ticket/ticket.model");
const createSprint = async (data) => {
    return await sprint_model_1.Sprint.create(data);
};
exports.createSprint = createSprint;
const getSprintsByProject = async (projectId) => {
    return await sprint_model_1.Sprint.find({ projectId }).sort({ startDate: 1 });
};
exports.getSprintsByProject = getSprintsByProject;
const updateSprint = async (sprintId, updates) => {
    return await sprint_model_1.Sprint.findByIdAndUpdate(sprintId, updates, { new: true });
};
exports.updateSprint = updateSprint;
const completeSprint = async (sprintId) => {
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
        throw new Error('Sprint not found');
    // Move incomplete tickets back to backlog
    await ticket_model_1.Ticket.updateMany({ sprintId, status: { $ne: 'Done' } }, { sprintId: null });
    return sprint;
};
exports.completeSprint = completeSprint;
