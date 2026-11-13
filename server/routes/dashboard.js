const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');

router.get('/summary', ctrl.getDashboardSummary);

module.exports = router;
