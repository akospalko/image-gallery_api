// route for handling verifying password reset link and updating user password
const express = require('express')
const router = express.Router();
// TODO: import controllers
const { checkLinkValidity, createNewPassword } = require('../../controllers/Authentication/passwordNew');

router.route('/')
.get(checkLinkValidity)
.post(createNewPassword);

module.exports = router;