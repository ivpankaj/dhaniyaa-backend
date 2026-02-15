import { Project, IProject } from './project.model';
import { User, UserRole } from '../user/user.model';
import mongoose from 'mongoose';

export const createProject = async (userId: string, data: { name: string; description?: string; organizationId: string; type?: string }) => {
    const project = await Project.create({
        ...data,
        createdBy: userId,
        members: [{ userId: userId, role: UserRole.PROJECT_ADMIN }]
    });
    return project;
};

export const getProjectsByOrg = async (organizationId: string, search?: string, page: number = 1, limit: number = 10) => {
    const query: any = { organizationId };

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
        .populate('members.userId', 'name email avatar')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    return { projects, total };
};

export const getProjectsForUser = async (userId: string, search?: string, page: number = 1, limit: number = 10) => {
    const query: any = { "members.userId": userId };

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
        .populate('members.userId', 'name email avatar')
        .populate('organizationId', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    return { projects, total };
};

export const getProjectById = async (projectId: string) => {
    return await Project.findById(projectId).populate('members.userId', 'name email avatar');
}

export const addMemberByEmail = async (projectId: string, email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const isMember = project.members.some((m: any) => m.userId.toString() === user._id.toString());
    if (isMember) throw new Error('User is already a member of this project');

    project.members.push({
        userId: user._id as any,
        role: UserRole.VIEWER
    });

    return await project.save();
};

export const updateProject = async (projectId: string, data: { name?: string; key?: string; description?: string; type?: string }) => {
    const project = await Project.findByIdAndUpdate(
        projectId,
        { $set: data },
        { new: true, runValidators: true }
    ).populate('members.userId', 'name email avatar');

    if (!project) throw new Error('Project not found');
    return project;
};

export const removeMember = async (projectId: string, userId: string) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    // Don't allow removing the project creator
    if (project.createdBy.toString() === userId) {
        throw new Error('Cannot remove the project creator');
    }

    project.members = project.members.filter((m: any) => m.userId.toString() !== userId);
    await project.save();

    return await Project.findById(projectId).populate('members.userId', 'name email avatar');
};

export const changeMemberRole = async (projectId: string, userId: string, newRole: UserRole) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const member = project.members.find((m: any) => m.userId.toString() === userId);
    if (!member) throw new Error('Member not found in project');

    // Don't allow changing the project creator's role
    if (project.createdBy.toString() === userId) {
        throw new Error('Cannot change the role of the project creator');
    }

    member.role = newRole;
    await project.save();

    return await Project.findById(projectId).populate('members.userId', 'name email avatar');
};


export const deleteProject = async (projectId: string, userId: string) => {
    const project = await Project.findById(projectId);
    if (!project) return null;

    if (project.createdBy.toString() !== userId) {
        throw new Error('Unauthorized: Only the project creator can delete this project');
    }

    return await Project.findByIdAndDelete(projectId);
};
