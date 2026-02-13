"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSprint = exports.getSprintsByProject = exports.createSprint = void 0;
const sprint_model_1 = require("./sprint.model");
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
