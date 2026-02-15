import { Request, Response, NextFunction } from 'express';
import { Invitation } from './invitation.model';
import { Project } from '../project/project.model';
import { User } from '../user/user.model';
import { sendInvitationEmail } from '../../utils/email.service';
import { UserRole } from '../user/user.model';

export const inviteMember = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id: projectId } = req.params;
        const { email } = req.body;
        const invitedBy = req.user!._id;

        const project = await Project.findById(projectId);
        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        // Check if requester is admin or creator
        const member = project.members.find(m => m.userId.toString() === invitedBy.toString());
        const isAdmin = member?.role === UserRole.PROJECT_ADMIN || project.createdBy.toString() === invitedBy.toString();

        if (!isAdmin) {
            res.status(403);
            throw new Error('Not authorized to invite members');
        }

        // Check if user is already a member
        // first find user by email to check existing membership
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const isMember = project.members.some(m => m.userId.toString() === existingUser._id.toString());
            if (isMember) {
                res.status(400);
                throw new Error('User is already a member of this project');
            }
        }

        // Check existing pending invite
        const existingInvite = await Invitation.findOne({ email, projectId, status: 'pending' });
        if (existingInvite) {
            res.status(400);
            throw new Error('Invitation already sent to this email');
        }

        const invitation = await Invitation.create({
            email,
            projectId,
            invitedBy
        });

        // Send Email
        const inviterName = req.user!.name;
        // Ideally use env var for frontend URL
        const loginLink = process.env.FRONTEND_URL || 'https://dhaniyaa.cookmytech.site/login';

        await sendInvitationEmail(
            email,
            inviterName,
            project.name,
            project.description || '',
            loginLink
        );

        res.status(201).json({ success: true, data: invitation });
    } catch (error) {
        next(error);
    }
};

export const getInvitations = async (req: any, res: Response, next: NextFunction) => {
    try {
        const email = req.user!.email;
        // Find invitations for this user's email with status pending
        const invitations = await Invitation.find({ email, status: 'pending' })
            .populate('projectId', 'name description')
            .populate('invitedBy', 'name');

        res.status(200).json({ success: true, data: invitations });
    } catch (error) {
        next(error);
    }
};

export const acceptInvitation = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user!._id;
        const userEmail = req.user!.email;

        const invitation = await Invitation.findById(id);
        if (!invitation) {
            res.status(404);
            throw new Error('Invitation not found');
        }

        // Verify email matches logged in user
        if (invitation.email !== userEmail) {
            res.status(403);
            throw new Error('This invitation is not for you');
        }

        if (invitation.status !== 'pending') {
            res.status(400);
            throw new Error('Invitation is not valid');
        }

        const project = await Project.findById(invitation.projectId);
        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        // Add user to project
        // Check concurrency again if needed, but simple push is okay
        const alreadyMember = project.members.some(m => m.userId.toString() === userId.toString());
        if (!alreadyMember) {
            project.members.push({ userId, role: UserRole.VIEWER }); // Default role
            await project.save();
        }

        invitation.status = 'accepted';
        await invitation.save();

        res.status(200).json({ success: true, message: 'Invitation accepted' });
    } catch (error) {
        next(error);
    }
};

export const rejectInvitation = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userEmail = req.user!.email;

        const invitation = await Invitation.findById(id);
        if (!invitation) {
            res.status(404);
            throw new Error('Invitation not found');
        }

        if (invitation.email !== userEmail) {
            res.status(403);
            throw new Error('This invitation is not for you');
        }

        invitation.status = 'rejected';
        await invitation.save();

        res.status(200).json({ success: true, message: 'Invitation rejected' });
    } catch (error) {
        next(error);
    }
};

export const getProjectInvitations = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id: projectId } = req.params;
        console.log(`Getting invitations for project: ${projectId}`);
        const invitations = await Invitation.find({ projectId, status: 'pending' })
            .populate('invitedBy', 'name email');
        console.log(`Found ${invitations.length} invitations`);

        res.status(200).json({ success: true, data: invitations });
    } catch (error) {
        next(error);
    }
};

export const deleteInvitation = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user!._id;

        const invitation = await Invitation.findById(id);
        if (!invitation) {
            res.status(404);
            throw new Error('Invitation not found');
        }

        // Verify that the requester is a member of the project (or created the invite)
        // Ideally we should check if they are ADMIN of the project.
        // For simplicity, we assume if they can reach this endpoint they are authorized or check InvitedBy match
        // A better check:
        const project = await Project.findById(invitation.projectId);
        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        const isMember = project.members.some(m => m.userId.toString() === userId.toString() && m.role === UserRole.PROJECT_ADMIN);
        const isOwner = project.createdBy.toString() === userId.toString();
        const isInviter = invitation.invitedBy.toString() === userId.toString();

        // If not explicitly a project admin or owner or the person who invited, check if they are AT LEAST a member with power
        // But for revocation, usually only Admins or the Inviter should be allowed.

        if (!isMember && !isOwner && !isInviter) {
            res.status(403);
            throw new Error('Not authorized to revoke invitation');
        }

        await invitation.deleteOne();

        res.status(200).json({ success: true, message: 'Invitation revoked' });
    } catch (error) {
        next(error);
    }
};
