import { Request, Response, NextFunction } from 'express';
import * as sprintService from './sprint.service';

export const create = async (req: any, res: Response, next: NextFunction) => {
    try {
        const sprint = await sprintService.createSprint(req.body);
        res.status(201).json({ success: true, data: sprint });
    } catch (error) {
        next(error);
    }
};

export const getByProject = async (req: any, res: Response, next: NextFunction) => {
    try {
        const sprints = await sprintService.getSprintsByProject(req.query.projectId as string);
        res.status(200).json({ success: true, data: sprints });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: any, res: Response, next: NextFunction) => {
    try {
        const sprint = await sprintService.updateSprint(req.params.id as string, req.body);
        res.status(200).json({ success: true, data: sprint });
    } catch (error) {
        next(error);
    }
};

export const complete = async (req: any, res: Response, next: NextFunction) => {
    try {
        const sprint = await sprintService.completeSprint(req.params.id as string);
        res.status(200).json({ success: true, data: sprint });
    } catch (error) {
        next(error);
    }
};
