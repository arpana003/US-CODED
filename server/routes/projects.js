const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/projectController');

const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 200 }),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('deadline').isISO8601().withMessage('Valid deadline required'),
  body('status').optional().isIn(['Planning', 'Active', 'Completed', 'On Hold']),
  body('progress').optional().isInt({ min: 0, max: 100 }),
];

router.get('/', ctrl.getProjects);
router.post('/', projectValidation, ctrl.createProject);
router.get('/:id', ctrl.getProject);
router.put('/:id', projectValidation, ctrl.updateProject);
router.delete('/:id', ctrl.deleteProject);
router.get('/:id/twin', ctrl.getDigitalTwin);

module.exports = router;
