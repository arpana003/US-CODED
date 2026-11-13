import express from 'express';
import {
  getTasks, getTaskById, createTask, updateTask, deleteTask
} from '../controllers/taskController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorizeRoles('admin'), createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)      // updateTask handles role check internally
  .delete(protect, authorizeRoles('admin'), deleteTask);

export default router;
