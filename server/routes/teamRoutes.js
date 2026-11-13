import express from 'express';
import {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} from '../controllers/teamController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Admin-only team management
router.use(protect, authorizeRoles('admin'));

router.route('/')
  .get(getTeamMembers)
  .post(createTeamMember);

router.route('/:id')
  .get(getTeamMemberById)
  .put(updateTeamMember)
  .delete(deleteTeamMember);

export default router;
