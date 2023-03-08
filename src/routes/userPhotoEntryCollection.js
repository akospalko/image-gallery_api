// route for handling user interaction with photo entries
const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../config/roles')
const verifyRoles = require('../middleware/verifyRoles')
const {  
  addPhotoIDToCollection,
  removePhotoIDFromCollection,
  getUserCollectionPhotoIDs,
  getUserCollectionPhotoEntries
} = require('../controllers/userPhotoEntryCollection');

// base route '/api/v1/user-photo-collection'
router.route('/')
.patch(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), addPhotoIDToCollection) // create/add photo entry to the users photo entry collection  
.delete(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), removePhotoIDFromCollection) // delete photo entry from the users photo entry collection  
router.route('/:userID').get(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), getUserCollectionPhotoIDs) // get all the photos from the user's photo entry collection

router.get('/gallery/myCollection', getUserCollectionPhotoEntries)
module.exports = router; 