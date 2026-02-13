import express from 'express';
import { getByEntity } from './activity.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/:entityId', getByEntity);

export default router;
