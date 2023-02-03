// route for handling imageEntries 
const express = require('express');
const router = express.Router();
const imageEntry = require('../middleware/imageEntry'); 

const { 
  createImageEntry,
  deleteImageEntry,
  getAllImageEntries,
  // updateImageEntry,
  // getSingleImageEntry,
} = require('../controllers/imageEntry');


router.route('/')
.post(imageEntry.single("imageName"), createImageEntry)
.get(getAllImageEntries); 

router.route('/:id')
.delete(deleteImageEntry);
// .get()
// .patch()

module.exports = router;