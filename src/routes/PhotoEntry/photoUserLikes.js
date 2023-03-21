// route for handling user interaction: like photo, remove like from photo
const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles')
const verifyRoles = require('../../middleware/verifyRoles')
const { addLikeToPhotoEntry, removeLikeFromPhotoEntry } = require('../../controllers/PhotoEntry/photoUserLikes');

router.route('/:userID/:photoEntryID')
.patch(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), addLikeToPhotoEntry) // add like to photo and return calculated values: photo liked by the current user, amount of users who liked the photo 
.delete(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), removeLikeFromPhotoEntry) // remove like from photo -/-/-

module.exports = router; 