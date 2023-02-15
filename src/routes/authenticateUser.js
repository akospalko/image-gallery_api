const express = require('express');
const router = express.Router();
const {loginUser, getUsers} = require('../controllers/authenticateUser');

router.route('/')
.post(loginUser)
.get(getUsers) // for testing

module.exports = router;