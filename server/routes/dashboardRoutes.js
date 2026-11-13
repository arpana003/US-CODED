import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, authorizeRoles('admin'), getDashboardSummary);

export default router;
