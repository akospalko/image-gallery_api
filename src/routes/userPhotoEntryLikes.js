// route for handling user interaction: like photo, remove like from photo
const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../config/roles')
const verifyRoles = require('../middleware/verifyRoles')
const {  
  addLike,  
  removeLike,
} = require('../controllers/userPhotoEntryLikes');

router.route('/:userID/:photoEntryID')
.patch(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), addLike) // add like to photo and return calculated values: photo liked by the current user, amount of users who liked the photo 
.delete(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), removeLike) // remove like from photo  
// .get(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), getSingleCollectionEntry)

module.exports = router; 