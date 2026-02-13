import express from 'express';
import { protect } from '../../middleware/auth.middleware';
import {
    inviteMember,
    getInvitations,
    acceptInvitation,
    rejectInvitation,
    deleteInvitation
} from './invitation.controller';

const router = express.Router();

router.use(protect); // All routes require auth

// Get my invitations
router.get('/', getInvitations);

// Respond to invitation
router.post('/:id/accept', acceptInvitation);
router.post('/:id/reject', rejectInvitation);
router.delete('/:id', deleteInvitation); // New route for revoking

// Send invitation (Project context)
// Note: Usually this might be under /projects/:id/invite, but we can keep it here if we pass projectId in body or params
// But to match RESTful patterns, let's keep project-specific actions under project routes?
// Actually, for simplicity, let's expose it here but requiring projectId in params is weird if route is /:id/invite.
// Let's use /api/invitations/send for sending? Or simply allow /api/projects/:id/invite to route to this controller?
// Let's stick to the implementation plan: `POST /api/projects/:id/invite`.
// So this route file will ONLY handle invitation-centric actions (get mine, accept, reject).
// The "invite" action will be mounted in project.routes.ts.

export default router;
