"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeMemberRole = exports.removeMember = exports.updateProject = exports.addMemberByEmail = exports.getProjectById = exports.getProjectsForUser = exports.getProjectsByOrg = exports.createProject = void 0;
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
    return await project_model_1.Project.find({ organizationId }).populate('members.userId', 'name email avatar');
};
exports.getProjectsByOrg = getProjectsByOrg;
const getProjectsForUser = async (userId) => {
    return await project_model_1.Project.find({ "members.userId": userId }).populate('members.userId', 'name email avatar').populate('organizationId', 'name');
};
exports.getProjectsForUser = getProjectsForUser;
const getProjectById = async (projectId) => {
    return await project_model_1.Project.findById(projectId).populate('members.userId', 'name email avatar');
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
const updateProject = async (projectId, data) => {
    const project = await project_model_1.Project.findByIdAndUpdate(projectId, { $set: data }, { new: true, runValidators: true }).populate('members.userId', 'name email avatar');
    if (!project)
        throw new Error('Project not found');
    return project;
};
exports.updateProject = updateProject;
const removeMember = async (projectId, userId) => {
    const project = await project_model_1.Project.findById(projectId);
    if (!project)
        throw new Error('Project not found');
    // Don't allow removing the project creator
    if (project.createdBy.toString() === userId) {
        throw new Error('Cannot remove the project creator');
    }
    project.members = project.members.filter((m) => m.userId.toString() !== userId);
    await project.save();
    return await project_model_1.Project.findById(projectId).populate('members.userId', 'name email avatar');
};
exports.removeMember = removeMember;
const changeMemberRole = async (projectId, userId, newRole) => {
    const project = await project_model_1.Project.findById(projectId);
    if (!project)
        throw new Error('Project not found');
    const member = project.members.find((m) => m.userId.toString() === userId);
    if (!member)
        throw new Error('Member not found in project');
    // Don't allow changing the project creator's role
    if (project.createdBy.toString() === userId) {
        throw new Error('Cannot change the role of the project creator');
    }
    member.role = newRole;
    await project.save();
    return await project_model_1.Project.findById(projectId).populate('members.userId', 'name email avatar');
};
exports.changeMemberRole = changeMemberRole;
