

import express from 'express';
import { register, login, updatePassword, googleLogin, setPassword, getMe } from './auth.controller';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema } from './auth.validation';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google-login', googleLogin);
router.put('/update-password', protect, updatePassword);
router.put('/set-password', protect, setPassword);
router.get('/me', protect, getMe);

export default router;
