import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectDigitalTwin
} from '../controllers/projectController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Admin-only project management
router.use(protect, authorizeRoles('admin'));

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

router.route('/:id/twin')
  .get(getProjectDigitalTwin);

export default router;
