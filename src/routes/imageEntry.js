// route for handling imageEntries 
const express = require('express');
const router = express.Router();
const imageEntry = require('../middleware/imageEntry'); 
const { 
  createImageEntry,
  deleteImageEntry,
  getAllImageEntries,
  getSingleImageEntry,
  updateImageEntry,
} = require('../controllers/imageEntry');

router.route('/')
.get(getAllImageEntries) 
.post(imageEntry.single("imageFile"), createImageEntry);

router.route('/:id')
.delete(deleteImageEntry)
.get(getSingleImageEntry)
.patch(imageEntry.single("imageFile"), updateImageEntry)

module.exports = router;