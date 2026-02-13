import express from 'express';
import { create, getByTicket } from './comment.controller';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createCommentSchema } from './comment.validation';

const router = express.Router();

router.use(protect);

router.post('/', validate(createCommentSchema), create);
router.get('/:ticketId', getByTicket);

export default router;
