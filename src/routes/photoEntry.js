// route for handling photo entries 
const express = require('express');
const router = express.Router();
const photoEntry = require('../middleware/photoEntry'); 
const ROLES_LIST = require('../config/roles');
const verifyRoles = require('../middleware/verifyRoles');

const { 
  getAllPhotoEntries,
  getSinglePhotoEntry,
  createPhotoEntry,
  deletePhotoEntry,
  updatePhotoEntry
} = require('../controllers/photoEntry');

router.route('/:collection')
.get(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), getAllPhotoEntries) 
.post(verifyRoles(ROLES_LIST.admin), photoEntry.single("photoFile"), createPhotoEntry);
router.route('/:collection/:photoEntryID')
.delete(verifyRoles(ROLES_LIST.admin), deletePhotoEntry)
.get(verifyRoles(ROLES_LIST.user, ROLES_LIST.admin), getSinglePhotoEntry)
.patch(verifyRoles(ROLES_LIST.editor, ROLES_LIST.admin), photoEntry.single("photoFile"), updatePhotoEntry)

module.exports = router;