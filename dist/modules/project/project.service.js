"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.changeMemberRole = exports.removeMember = exports.updateProject = exports.addMemberByEmail = exports.getProjectById = exports.getProjectsForUser = exports.getProjectsByOrg = exports.createProject = void 0;
const project_model_1 = require("./project.model");
const user_model_1 = require("../user/user.model");
const sprint_service_1 = require("../sprint/sprint.service");
const createProject = async (userId, data) => {
    const project = await project_model_1.Project.create({
        ...data,
        createdBy: userId,
        members: [{ userId: userId, role: user_model_1.UserRole.PROJECT_ADMIN }]
    });
    // Automatically create the first cycle (sprint) for the project
    try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 14); // Default 2 week cycle
        await (0, sprint_service_1.createSprint)(userId, {
            name: 'Cycle 1',
            projectId: project._id,
            startDate,
            endDate,
            goal: 'Initial setup and planning',
            status: 'PLANNED'
        });
    }
    catch (error) {
        console.error('Failed to create automatic cycle for project:', error);
    }
    return project;
};
exports.createProject = createProject;
const getProjectsByOrg = async (organizationId, search, page = 1, limit = 10) => {
    const query = { organizationId };
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    const total = await project_model_1.Project.countDocuments(query);
    const projects = await project_model_1.Project.find(query)
        .populate('members.userId', 'name email avatar')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    return { projects, total };
};
exports.getProjectsByOrg = getProjectsByOrg;
const getProjectsForUser = async (userId, search, page = 1, limit = 10) => {
    const query = { "members.userId": userId };
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    const total = await project_model_1.Project.countDocuments(query);
    const projects = await project_model_1.Project.find(query)
        .populate('members.userId', 'name email avatar')
        .populate('organizationId', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    return { projects, total };
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
const deleteProject = async (projectId, userId) => {
    const project = await project_model_1.Project.findById(projectId);
    if (!project)
        return null;
    if (project.createdBy.toString() !== userId) {
        throw new Error('Unauthorized: Only the project creator can delete this project');
    }
    return await project_model_1.Project.findByIdAndDelete(projectId);
};
exports.deleteProject = deleteProject;
