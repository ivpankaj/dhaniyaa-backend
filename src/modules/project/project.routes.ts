import express from 'express';
import { create, getByOrg, getOne, update, removeMember, changeMemberRole, deleteProject } from './project.controller';
import { inviteMember, getProjectInvitations } from '../invitation/invitation.controller';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createProjectSchema } from './project.validation';

const router = express.Router();

router.use(protect);

router.post('/', validate(createProjectSchema), create);
router.get('/', getByOrg);
router.get('/:id', getOne);
router.patch('/:id', update);
router.post('/:id/invite', inviteMember);
router.get('/:id/invitations', getProjectInvitations);
router.delete('/:id/members/:memberId', removeMember);
router.patch('/:id/members/:memberId', changeMemberRole);
router.delete('/:id', deleteProject);

export default router;

