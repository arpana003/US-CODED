import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.js';
import {
  getMyDashboard,
  getMyTasks,
  getMyTaskById,
  updateMyTaskStatus,
  addTaskComment,
  getMyProfile,
  updateMyProfile,
} from '../controllers/employeeController.js';

const router = express.Router();

// All employee routes require authentication
router.use(protect);
// All employee routes require employee role
router.use(authorizeRoles('employee'));

router.get('/dashboard', getMyDashboard);
router.get('/tasks', getMyTasks);
router.get('/tasks/:id', getMyTaskById);
router.put('/tasks/:id/status', updateMyTaskStatus);
router.post('/tasks/:id/comment', addTaskComment);
router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);

export default router;

