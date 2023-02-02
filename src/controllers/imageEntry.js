// route for handling imageEntries 
const express = require('express');
const ImageEntry = require('../models/ImageEntrySchema');
const router = express.Router();
const imageEntry = require('../middleware/imageEntry'); 
const asyncWrapper = require('../middleware/asyncWrapper');

// router.post("/image-entry", imageEntry.single("file"), async (req, res) => {

const createImageEntry = asyncWrapper(async (req, res) => {
  const {title, author, coordinate, description} = req.body;
  const {filename:imageURL} = req.file;
  // console.log('dataB:', title, author, coordinate, description);
  // console.log('dataF', req.file);
  // console.log('request', req);
  const entryData = {title, author, coordinate, description, imageURL} 
  const imageEntry = await ImageEntry.create(entryData);
  res.status(201).json({ imageEntry }); 
})

module.exports = {
  createImageEntry
};