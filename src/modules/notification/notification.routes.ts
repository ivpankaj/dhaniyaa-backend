import express from 'express';
import { getMine, markRead, markAllRead } from './notification.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', getMine);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);

export default router;
