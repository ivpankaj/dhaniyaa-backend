"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivitiesByProject = exports.getActivitiesByEntity = exports.createActivity = void 0;
const activity_model_1 = require("./activity.model");
const createActivity = async (data) => {
    return await activity_model_1.Activity.create(data);
};
exports.createActivity = createActivity;
const getActivitiesByEntity = async (entityId) => {
    return await activity_model_1.Activity.find({ entityId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(50);
};
exports.getActivitiesByEntity = getActivitiesByEntity;
const getActivitiesByProject = async (projectId) => {
    // This is a bit complex without joining, usually we query activities where entityId is in the list of tickets for a project, or the project log itself.
    // For simplicity, let's just log project-level activities for now or add a projectId field to Activity.
    // Adding projectId to Activity model would be better for efficient querying.
    // But for now, let's just return project level.
    return await activity_model_1.Activity.find({ entityId: projectId }).populate('userId', 'name').sort({ createdAt: -1 });
};
exports.getActivitiesByProject = getActivitiesByProject;
