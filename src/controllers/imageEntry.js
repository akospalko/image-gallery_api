// handle image entry CRUD operations  
const ImageEntry = require('../models/ImageEntrySchema');
const asyncWrapper = require('../middleware/asyncWrapper');
const randomName = require('../helper/randomName');
const resizeImage = require('../middleware/resizeImage');
const { 
  uploadImage,
  deleteImage,
  getStorageSignedURL
} = require('../middleware/storage');

//GET all image entries
const getAllImageEntries = asyncWrapper(async (req, res) => {
  const imageEntries = await ImageEntry.find({}).lean(); // get database entry as a plain object (.lean()) -> converts mongoose doc to plain obj -> allows to add properties to the obj (e.g. imageURL);
  if(!imageEntries) return res.status(404).json({ success: false, message: 'Couldn\'t fetch entries' });   // if unsuccessful return error message
  await getStorageSignedURL(imageEntries); // get each fetched image name and create signed url for them (by passing img name to the getObjectParams' key prop).  
  res.status(200).json({ success: true, imageEntries, message: 'All entries were successfully fetched' }); 
})
//GET single entry
const getSingleImageEntry = asyncWrapper(async (req, res, next) => {
  const { id: entryID } = req.params;
  const imageEntry = await ImageEntry.findOne({ _id: entryID }).lean(); // get db entry as plain object
  if (!imageEntry) return res.status(404).json({ success: false, message: `Entry was not found. ID: ${entryID}` });
  await getStorageSignedURL(imageEntry); // get signed url, assign  value to imageURL field  
  res.status(200).json({ success: true, imageEntry, message: `Entry is fetched successfully. ID: ${entryID}` });
})
//CREATE image entry
const createImageEntry = asyncWrapper(async (req, res) => {
  const {title, author, gpsLatitude, gpsLongitude, captureDate, description} = req.body;
  const {buffer, mimetype} = req.file;
  const resizedImageBuffer = await resizeImage(buffer);  // resize image before upload using sharp
  const imageName = randomName();  // generate randomized image name 
  await uploadImage(imageName, resizedImageBuffer, mimetype);
  const entryData = {title, author, gpsLatitude, gpsLongitude, captureDate, description, imageName} 
  const imageEntry = await ImageEntry.create(entryData); 
  if(!imageEntry) return res.status(400).json({ success: false, message: 'Could not create entry. Try again!' }); 
  res.status(201).json({ success: true, imageEntry, message: 'Entry created successfully' }); 
})

//TODO: create imageFile -> separeate imageName from imageFile 
//UPDATE (PATCH) image entry
const updateImageEntry = asyncWrapper(async (req, res, next) => {
  const { id: entryID } = req.params; 
  const { title, author, gpsLatitude, gpsLongitude, captureDate, description } = req.body; // new req data 
  let updateData = {title, author, gpsLatitude, gpsLongitude, captureDate, description}; // new data we want to update the db with 
  if(req.file) {
    const fetchedImageEntry = await ImageEntry.findOne({ _id: entryID });
    if(!fetchedImageEntry) return res.status(404).json({ success: false, message: `No image entry with id: ${entryID}` });
    const imageName = fetchedImageEntry.imageName;
    updateData = {...updateData, imageName};
    const resizedImageBuffer = await resizeImage(req.file.buffer); // resize image
    await uploadImage(imageName, resizedImageBuffer, req.file.mimetype); // upload image
  }
  const imageEntry = await ImageEntry.findOneAndUpdate({ _id: entryID }, updateData, { // update entry
    new: true,
    runValidators: true
  });
  if (!imageEntry) return res.status(404).json({ success: true, message: `No entry with ID : ${entryID}`});
  res.status(200).json({ success: true, imageEntry, message: `Entry is fetched successfully. ID: ${entryID}`});
})

//DELETE image entry
const deleteImageEntry = asyncWrapper(async (req, res, next) => {
  const { id: entryID } = req.params;
  const fetchedImageEntry = await ImageEntry.findOne({ _id: entryID }); // get db single entry
  if (!fetchedImageEntry) return res.status(404).json({ success: false, message: `No image entry with id : ${entryID}` })
  await deleteImage(fetchedImageEntry.imageName); // delete image from storage
 
  const imageEntry = await ImageEntry.findOneAndDelete({ _id: entryID })
  if (!imageEntry) return res.status(404).json({ success: false, message: 'Entry does not exist'});
  res.status(200).json({ success: true, imageEntry, message: `Entry deleted successfully. ID: ${entryID}` });
})

module.exports = { 
  getAllImageEntries,
  getSingleImageEntry,
  createImageEntry,
  deleteImageEntry,
  updateImageEntry
};