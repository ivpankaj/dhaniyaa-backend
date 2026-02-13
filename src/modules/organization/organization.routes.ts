import express from 'express';
import { createOrg, getMyOrgs, invite } from './organization.controller';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createOrgSchema } from './organization.validation';

const router = express.Router();

router.use(protect);

router.post('/', validate(createOrgSchema), createOrg);
router.get('/', getMyOrgs);
router.post('/:id/invite', invite);

export default router;
