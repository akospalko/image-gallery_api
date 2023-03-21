// route for handling user interaction: add photo to user's collection / remove photo from user's collection
const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles')
const verifyRoles = require('../../middleware/verifyRoles')
const {  
  addPhotoEntryToCollection,  
  removePhotoEntryFromCollection,
} = require('../../controllers/PhotoEntry/photoUserCollection');

router.route('/:userID/:photoEntryID')
.patch(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), addPhotoEntryToCollection) // create/add photo entry to the users photo entry collection  
.delete(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), removePhotoEntryFromCollection) // delete photo entry from the users photo entry collection  


module.exports = router; 