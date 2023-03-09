// handle photo entry CRUD operations  
const PhotoEntryHome = require('../models/PhotoEntryHomeSchema');
const asyncWrapper = require('../middleware/asyncWrapper');
const { getStorageSignedURL } = require('../middleware/storage');

// GET all photo entries from home Collection, displayed on the home page photo carousel   
const getAllHomePhotos = asyncWrapper(async (req, res) => {
  const photoEntries = await PhotoEntryHome.find({}).lean(); // get database entry as a plain object (.lean()) -> converts mongoose doc to plain obj -> allows to add properties to the obj (e.g. photoURL);
  if(!photoEntries) return res.status(404).json({ success: false, message: 'Couldn\'t fetch photos' });   // if unsuccessful return error message
  await getStorageSignedURL(photoEntries); // get each fetched file name and create signed url for them (by passing img name to the getObjectParams' key prop).  
  res.status(200).json({ success: true, photoEntries, message: 'All photos were successfully fetched' }); 
})

module.exports = { getAllHomePhotos };