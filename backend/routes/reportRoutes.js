const express = require('express');
const {
  getUtilizationReport,
  getRevenue,
  getDashboardSummary,
} = require('../controllers/reportController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/utilization', getUtilizationReport);
router.get('/revenue', getRevenue);
router.get('/dashboard', getDashboardSummary);

module.exports = router;
