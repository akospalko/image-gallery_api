// route for calculating and returning basic project metrics/statistics
const express = require('express');
const router = express.Router();
const { getProjectMetrics } = require('../../controllers/ProjectMetrics/projectMetrics');

router.route('/').get(getProjectMetrics);

module.exports = router;