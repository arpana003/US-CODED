const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/teamController');

const memberValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('role').trim().notEmpty().withMessage('Role is required').isLength({ max: 100 }),
];

router.get('/', ctrl.getTeamMembers);
router.post('/', memberValidation, ctrl.createTeamMember);
router.put('/:id', memberValidation, ctrl.updateTeamMember);
router.delete('/:id', ctrl.deleteTeamMember);

module.exports = router;
