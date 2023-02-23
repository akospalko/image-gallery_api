// route for handling imageEntries 
const express = require('express');
const router = express.Router();
const imageEntry = require('../middleware/imageEntry'); 
const ROLES_LIST = require('../config/roles');
const verifyRoles = require('../middleware/verifyRoles');

const { 
  createImageEntry,
  deleteImageEntry,
  getAllImageEntries,
  getSingleImageEntry,
  updateImageEntry,
} = require('../controllers/imageEntry');

router.route('/')
.get(getAllImageEntries) 
.post(verifyRoles(ROLES_LIST.admin), imageEntry.single("imageFile"), createImageEntry);

router.route('/:id')
.delete(verifyRoles(ROLES_LIST.admin), deleteImageEntry)
.get(verifyRoles(ROLES_LIST.editor, ROLES_LIST.admin), getSingleImageEntry)
.patch(verifyRoles(ROLES_LIST.editor, ROLES_LIST.admin), imageEntry.single("imageFile"), updateImageEntry)

module.exports = router;