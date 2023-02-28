// handle image entry CRUD operations  
const ImageEntryHome = require('../models/ImageEntryHomeSchema');
const asyncWrapper = require('../middleware/asyncWrapper');
const { getStorageSignedURL } = require('../middleware/storage');
// GET all photos (image entries) to be displayed on the home page for anuth users 
const getAllHomePhotos = asyncWrapper(async (req, res) => {
  const imageEntries = await ImageEntryHome.find({}).lean(); // get database entry as a plain object (.lean()) -> converts mongoose doc to plain obj -> allows to add properties to the obj (e.g. imageURL);
  if(!imageEntries) return res.status(404).json({ success: false, message: 'Couldn\'t fetch photos' });   // if unsuccessful return error message
  await getStorageSignedURL(imageEntries); // get each fetched image name and create signed url for them (by passing img name to the getObjectParams' key prop).  
  res.status(200).json({ success: true, imageEntries, message: 'All photos were successfully fetched' }); 
})

module.exports = { getAllHomePhotos };