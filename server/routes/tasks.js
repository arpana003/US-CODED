const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/taskController');

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 300 }),
  body('project').notEmpty().withMessage('Project is required').isMongoId(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Done']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('deadline').optional().isISO8601().withMessage('Valid deadline required'),
  body('assignedTo').optional({ nullable: true }).isMongoId(),
];

router.get('/', ctrl.getTasks);
router.post('/', taskValidation, ctrl.createTask);
router.get('/:id', ctrl.getTask);
router.put('/:id', taskValidation, ctrl.updateTask);
router.delete('/:id', ctrl.deleteTask);

module.exports = router;
