import express from 'express';
import {
  getFullAnalysis,
  triggerAnalysis,
  getPredictions,
  getRisks,
  getPrioritizedTasks,
  getWorkloadAnalysis,
  getBriefing,
  getRecommendations,
  acceptRecommendation,
  dismissRecommendation,
  runSimulation,
  askAdminQuestion,
  askEmployeeQuestion,
  getRecommendationHistory
} from '../controllers/aiController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// Employee AI Assistant endpoint (accessible by both employee and admin)
router.post('/employee/ask', authorizeRoles('employee', 'admin'), askEmployeeQuestion);

// Admin-only AI endpoints
router.get('/analyze', authorizeRoles('admin'), getFullAnalysis);
router.post('/analyze/trigger', authorizeRoles('admin'), triggerAnalysis);
router.get('/predictions', authorizeRoles('admin'), getPredictions);
router.get('/risks', authorizeRoles('admin'), getRisks);
router.get('/tasks/priority', authorizeRoles('admin'), getPrioritizedTasks);
router.get('/workload', authorizeRoles('admin'), getWorkloadAnalysis);
router.get('/briefing', authorizeRoles('admin'), getBriefing);
router.get('/recommendations', authorizeRoles('admin'), getRecommendations);
router.post('/recommendations/:id/accept', authorizeRoles('admin'), acceptRecommendation);
router.post('/recommendations/:id/dismiss', authorizeRoles('admin'), dismissRecommendation);
router.post('/simulate', authorizeRoles('admin'), runSimulation);
router.post('/ask', authorizeRoles('admin'), askAdminQuestion);
router.get('/history', authorizeRoles('admin'), getRecommendationHistory);

export default router;

