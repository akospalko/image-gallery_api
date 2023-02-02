// route for handling imageEntries 
const express = require('express');
const router = express.Router();
const imageEntry = require('../middleware/imageEntry'); 

const { 
  createImageEntry,
  // updateImageEntry,
  // deleteImageEntry,
  // getAllImageEntries,
  // getSingleImageEntry,
} = require('../controllers/imageEntry');

// router.post("/image-entry", imageEntry.single("file"), async (req, res) => {
// router.route("/").post(imageEntry.single("imageURL"), createImageEntry); 
router.post("/", imageEntry.single("imageURL"), createImageEntry); 

module.exports = router;