import { Request, Response, NextFunction } from 'express';
import * as organizationService from './organization.service';

export const createOrg = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        // req.user is populated by protect middleware
        const org = await organizationService.createOrganization(req.user!._id.toString(), name);
        res.status(201).json({ success: true, data: org });
    } catch (error) {
        next(error);
    }
};

export const getMyOrgs = async (req: any, res: Response, next: NextFunction) => {
    try {
        const orgs = await organizationService.getUserOrganizations(req.user!._id.toString());
        res.status(200).json({ success: true, data: orgs });
    } catch (error) {
        next(error);
    }
};

export const invite = async (req: any, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { email } = req.body;
        const organization = await organizationService.inviteMember(id, email);
        res.status(200).json({ success: true, data: organization });
    } catch (error) {
        next(error);
    }
};
