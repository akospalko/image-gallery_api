// route for photo downloads 
const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles')
const verifyRoles = require('../../middleware/verifyRoles')
const { downloadPhoto } = require('../../controllers/PhotoEntry/photoDownloads')
const applyRateLimit = require('../../middleware/applyRateLimit');

router.route('/:userID/:photoEntryID')
.patch(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), applyRateLimit, downloadPhoto) 

module.exports = router; 