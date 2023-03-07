// TODO: route for handling user interaction with photo entries
const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../config/roles')
const verifyRoles = require('../middleware/verifyRoles')
const {  
  addPhotoEntryToCollection,
  removePhotoEntryFromCollection
} = require('../controllers/userPhotoEntryCollection');

router.route('/')
.patch(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), addPhotoEntryToCollection)
.delete(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), removePhotoEntryFromCollection)
module.exports = router; 