const express = require('express')
const router = express.Router();
// TODO: import controllers
const { resetUserPassword } = require('../../controllers/Authentication/passwordReset');

router.route('/').post(resetUserPassword);

module.exports = router;