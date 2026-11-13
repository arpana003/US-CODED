import express from 'express';
import { register, login, getMe, forgotPassword, createEmployee } from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);
router.post('/create-employee', protect, authorizeRoles('admin'), createEmployee);

export default router;
