import express from 'express';
import { chatWithAdrak } from './ai.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

// Chat with Adrak - Protected route as it uses API quota
router.post('/chat', protect, chatWithAdrak);

export default router;
