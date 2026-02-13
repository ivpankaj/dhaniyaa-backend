"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMemberByEmail = exports.getProjectById = exports.getProjectsByOrg = exports.createProject = void 0;
const project_model_1 = require("./project.model");
const user_model_1 = require("../user/user.model");
const createProject = async (userId, data) => {
    const project = await project_model_1.Project.create({
        ...data,
        createdBy: userId,
        members: [{ userId: userId, role: user_model_1.UserRole.PROJECT_ADMIN }]
    });
    return project;
};
exports.createProject = createProject;
const getProjectsByOrg = async (organizationId) => {
    return await project_model_1.Project.find({ organizationId }).populate('members.userId', 'name email');
};
exports.getProjectsByOrg = getProjectsByOrg;
const getProjectById = async (projectId) => {
    return await project_model_1.Project.findById(projectId).populate('members.userId', 'name email');
};
exports.getProjectById = getProjectById;
const addMemberByEmail = async (projectId, email) => {
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        throw new Error('User not found');
    const project = await project_model_1.Project.findById(projectId);
    if (!project)
        throw new Error('Project not found');
    const isMember = project.members.some((m) => m.userId.toString() === user._id.toString());
    if (isMember)
        throw new Error('User is already a member of this project');
    project.members.push({
        userId: user._id,
        role: user_model_1.UserRole.VIEWER
    });
    return await project.save();
};
exports.addMemberByEmail = addMemberByEmail;
