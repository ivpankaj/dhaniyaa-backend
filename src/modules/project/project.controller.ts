import { Request, Response, NextFunction } from 'express';
import * as projectService from './project.service';

export const create = async (req: any, res: Response, next: NextFunction) => {
    try {
        const project = await projectService.createProject(req.user!._id.toString(), req.body);
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

export const getByOrg = async (req: any, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.query.organizationId as string;
        let projects;

        if (organizationId) {
            projects = await projectService.getProjectsByOrg(organizationId);
        } else {
            // If no org ID provided, return all projects the user is a member of
            projects = await projectService.getProjectsForUser(req.user!._id.toString());
        }

        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req: any, res: Response, next: NextFunction) => {
    try {
        const project = await projectService.getProjectById(req.params.id as string);
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
}

export const invite = async (req: any, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { email } = req.body;
        const project = await projectService.addMemberByEmail(id, email);
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: any, res: Response, next: NextFunction) => {
    try {
        const project = await projectService.updateProject(req.params.id, req.body);
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

export const removeMember = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id, memberId } = req.params;
        const project = await projectService.removeMember(id, memberId);
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

export const changeMemberRole = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id, memberId } = req.params;
        const { role } = req.body;
        const project = await projectService.changeMemberRole(id, memberId, role);
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

