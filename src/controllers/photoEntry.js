// handle photo entry CRUD operations  
const PhotoEntryGallery = require('../models/PhotoEntryGallerySchema');
const PhotoEntryHome = require('../models/PhotoEntryHomeSchema');
const asyncWrapper = require('../middleware/asyncWrapper');
const randomName = require('../helper/randomName');
const resizePhoto = require('../middleware/resizePhoto');
const { 
  uploadPhoto,
  deletePhoto,
  getStorageSignedURL
} = require('../middleware/storage');

// find active collection
const findActiveCollection = (collectionName) => {
  let foundCollection;
  if(collectionName === 'home') { // home photos
    foundCollection = PhotoEntryHome;
  } else if (collectionName === 'gallery') {
    foundCollection = PhotoEntryGallery;
  }
  return foundCollection;
}
// GET all photo entries
const getAllPhotoEntries = asyncWrapper(async (req, res) => {
  const { collection } = req.params;
  const activeCollection = findActiveCollection(collection); // get active collection
  const photoEntries = await activeCollection.find({}).lean(); // get database entry as a plain object (.lean()) -> converts mongoose doc to plain obj -> allows to add properties to the obj (e.g. photoURL);
  if(!photoEntries) return res.status(404).json({ success: false, message: 'Couldn\'t fetch entries' });   // if unsuccessful return error message
  await getStorageSignedURL(photoEntries); // get each fetched entry's photo name and create signed url for them (by passing photo name to the getObjectParams' key prop).  
  res.status(200).json({ success: true, photoEntries, message: 'All entries were successfully fetched' }); 
})
// GET single entry
const getSinglePhotoEntry = asyncWrapper(async (req, res, next) => {
  const { id: entryID, collection } = req.params;
  const activeCollection = findActiveCollection(collection); // get active collection
  const photoEntry = await activeCollection.findOne({ _id: entryID }).lean(); // get db entry as plain object
  if (!photoEntry) return res.status(404).json({ success: false, message: `Entry was not found. ID: ${entryID}` });
  await getStorageSignedURL(photoEntry); // get signed url, assign  value to photoURL field  
  res.status(200).json({ success: true, photoEntry, message: `Entry is fetched successfully. ID: ${entryID}` });
})
// CREATE photo entry
const createPhotoEntry = asyncWrapper(async (req, res) => {
  const { collection } = req.params;
  const activeCollection = findActiveCollection(collection); // get active collection
  const {title, author, gpsLatitude, gpsLongitude, captureDate, description} = req.body;
  const {buffer, mimetype} = req.file;
  const resizedFileBuffer = await resizePhoto(buffer);  // resize file before upload using sharp
  const photoName = randomName();  // generate randomized photo name 
  await uploadPhoto(photoName, resizedFileBuffer, mimetype);
  const entryData = {title, author, gpsLatitude, gpsLongitude, captureDate, description, photoName, inCollection: [], likes: []} 
  const photoEntry = await activeCollection.create(entryData); 
  if(!photoEntry) return res.status(400).json({ success: false, message: 'Could not create entry. Try again!' }); 
  res.status(201).json({ success: true, photoEntry, message: 'Entry created successfully' }); 
})
// UPDATE (PATCH) photo entry
const updatePhotoEntry = asyncWrapper(async (req, res, next) => {
  const { id: entryID, collection } = req.params; 
  const activeCollection = findActiveCollection(collection); // get active collection
  const { title, author, gpsLatitude, gpsLongitude, captureDate, description } = req.body; // new req data 
  let updateData = { title, author, gpsLatitude, gpsLongitude, captureDate, description }; // new data we want to update the db with 
  if(req.file) {
    const fetchedPhotoEntry = await activeCollection.findOne({ _id: entryID });
    if(!fetchedPhotoEntry) return res.status(404).json({ success: false, message: `No photo entry with id: ${entryID}` });
    const photoName = fetchedPhotoEntry.photoName;
    updateData = {...updateData, photoName};
    const resizedFileBuffer = await resizePhoto(req.file.buffer); // resize photo
    await uploadPhoto(photoName, resizedFileBuffer, req.file.mimetype); // upload photo
  }
  const photoEntry = await activeCollection.findOneAndUpdate({ _id: entryID }, updateData, { // update entry
    new: true,
    runValidators: true
  });
  if (!photoEntry) return res.status(404).json({ success: true, message: `No entry with ID : ${entryID}`});
  res.status(200).json({ success: true, photoEntry, message: `Entry is fetched successfully. ID: ${entryID}`});
})
// DELETE photo entry 
const deletePhotoEntry = asyncWrapper(async (req, res) => {
  const { id: entryID, collection } = req.params;
  const activeCollection = findActiveCollection(collection); // get active collection
  const fetchedPhotoEntry = await activeCollection.findOne({ _id: entryID }); // get db single entry
  if (!fetchedPhotoEntry) return res.status(404).json({ success: false, message: `No photo entry with id : ${entryID}` })
  await deletePhoto(fetchedPhotoEntry.photoName); // delete photo from storage
  const photoEntry = await activeCollection.findOneAndDelete({ _id: entryID })
  if (!photoEntry) return res.status(404).json({ success: false, message: 'Entry does not exist'});
  res.status(200).json({ success: true, photoEntry, message: `Entry deleted successfully. ID: ${entryID}` });
})

module.exports = { 
  getAllPhotoEntries,
  getSinglePhotoEntry,
  createPhotoEntry,
  deletePhotoEntry,
  updatePhotoEntry
};