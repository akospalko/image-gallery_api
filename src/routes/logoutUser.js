// route for for logging out user, handling cookie removal
const express = require('express');
const router = express.Router();
const { logoutUser } = require('../controllers/logoutUser'); 

router.route('/').get(logoutUser);  

module.exports = router;
