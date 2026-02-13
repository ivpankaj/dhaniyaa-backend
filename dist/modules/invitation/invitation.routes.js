"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const invitation_controller_1 = require("./invitation.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect); // All routes require auth
// Get my invitations
router.get('/', invitation_controller_1.getInvitations);
// Respond to invitation
router.post('/:id/accept', invitation_controller_1.acceptInvitation);
router.post('/:id/reject', invitation_controller_1.rejectInvitation);
router.delete('/:id', invitation_controller_1.deleteInvitation); // New route for revoking
// Send invitation (Project context)
// Note: Usually this might be under /projects/:id/invite, but we can keep it here if we pass projectId in body or params
// But to match RESTful patterns, let's keep project-specific actions under project routes?
// Actually, for simplicity, let's expose it here but requiring projectId in params is weird if route is /:id/invite.
// Let's use /api/invitations/send for sending? Or simply allow /api/projects/:id/invite to route to this controller?
// Let's stick to the implementation plan: `POST /api/projects/:id/invite`.
// So this route file will ONLY handle invitation-centric actions (get mine, accept, reject).
// The "invite" action will be mounted in project.routes.ts.
exports.default = router;
