import express from 'express';
import { create, getByProject, update, updateStatus, getBySprint, deleteTicket, toggleWatch, getById } from './ticket.controller';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTicketSchema, updateTicketSchema, updateTicketStatusSchema } from './ticket.validation';

const router = express.Router();


router.use(protect);

router.post('/', validate(createTicketSchema), create);
router.get('/', getByProject);
router.get('/sprint/:sprintId', getBySprint);
router.get('/:id', getById);
router.patch('/:id/watch', toggleWatch);
router.patch('/:id', validate(updateTicketSchema), update);
router.patch('/:id/status', validate(updateTicketStatusSchema), updateStatus);
router.delete('/:id', deleteTicket);

export default router;
