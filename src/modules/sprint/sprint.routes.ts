import express from 'express';
import { create, getByProject, update, complete, deleteSprint } from './sprint.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', create);
router.get('/', getByProject);
router.patch('/:id', update);
router.patch('/:id/complete', complete);

router.delete('/:id', deleteSprint);

export default router;
