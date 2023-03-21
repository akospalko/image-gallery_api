// handle photo gallery CRUD operations (all but the all photo entry getter is used with home page photos)  
const PhotoEntryGallery = require('../../models/PhotoEntryGallerySchema');
const PhotoEntryHome = require('../../models/PhotoEntryHomeSchema');
const asyncWrapper = require('../../middleware/asyncWrapper');
const randomName = require('../../helper/randomName');
const resizePhoto = require('../../middleware/resizePhoto');
const { modifyPhotoEntryMultipleParameter } = require('../../helper/modifyQueriedPhoto');
const { 
  uploadPhoto,
  deletePhoto,
  getStorageSignedURL
} = require('../../middleware/storage');

// -----HELPER FUNCTION-----
// find active collection btw gallery and home photos
const findActiveCollection = (collectionName) => {
  let foundCollection;
  if(collectionName === 'home') { // home photos
    foundCollection = PhotoEntryHome;
  } else if (collectionName === 'gallery') {
    foundCollection = PhotoEntryGallery;
  }
  return foundCollection;
}

// -----CRUD-----
// GET all photo entries: home, gallery
const getPhotoEntries = asyncWrapper(async (req, res) => {
  const { userID, collectionType } = req.query; // collectionType: all (full gallery entries) || own (collection of photos created by the user)
  if (!userID ||!collectionType) return sendStatus(401); // necessary params are not provided
  let photoEntries;
  if (collectionType === 'all') { // get all photo entries
    photoEntries = await PhotoEntryGallery.find({}).lean(); // get database entry as a plain object (.lean()) -> converts mongoose doc to plain obj -> allows to add properties to the obj (e.g. photoURL);
  } else if(collectionType === 'own') { // get user's collection photo entries
    photoEntries = await PhotoEntryGallery.find({ 'inCollection' : { $in: userID } }).lean(); // query all the photos stored in user's collection
  }
  if(!photoEntries) return res.status(404).json({ success: false, message: 'Couldn\'t fetch entries' });   // if unsuccessful return error message
  const modifiedPhotoEntries = modifyPhotoEntryMultipleParameter(photoEntries, userID); // process queied photo entries
  await getStorageSignedURL(modifiedPhotoEntries); // create signed url for the photos   
  res.status(200).json({ success: true, photoEntries: modifiedPhotoEntries, message: 'All entries were successfully fetched' }); 
})
// GET single entry
const getSinglePhotoEntry = asyncWrapper(async (req, res) => {
  const { collection, photoEntryID } = req.params;
  const activeCollection = findActiveCollection(collection); // get active collection
  const photoEntry = await activeCollection.findOne({ _id: photoEntryID }).lean(); // get db entry as plain object
  if (!photoEntry) return res.status(404).json({ success: false, message: `Entry was not found. ID: ${ photoEntryID }` });
  await getStorageSignedURL(photoEntry); // get signed url, assign  value to photoURL field  
  res.status(200).json({ success: true, photoEntry, message: `Entry is fetched successfully. ID: ${ photoEntryID }` });
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
  let entryData = {title, author, gpsLatitude, gpsLongitude, captureDate, description, photoName} 
  if(collection === 'gallery') { entryData = {...entryData, inCollection: [], likes: []} } 
  const photoEntry = await activeCollection.create(entryData); 
  if(!photoEntry) return res.status(400).json({ success: false, message: 'Could not create entry. Try again!' }); 
  res.status(201).json({ success: true, photoEntry, message: 'Entry created successfully' }); 
})
// UPDATE (PATCH) photo entry
const updatePhotoEntry = asyncWrapper(async (req, res) => {
  const { collection, photoEntryID } = req.params; 
  const activeCollection = findActiveCollection(collection); // get active collection
  const { title, author, gpsLatitude, gpsLongitude, captureDate, description } = req.body; // new req data 
  let updateData = { title, author, gpsLatitude, gpsLongitude, captureDate, description }; // new data we want to update the db with 
  if(req.file) {
    const fetchedPhotoEntry = await activeCollection.findOne({ _id: photoEntryID });
    if(!fetchedPhotoEntry) return res.status(404).json({ success: false, message: `No photo entry with id: ${photoEntryID}` });
    const photoName = fetchedPhotoEntry.photoName;
    updateData = { ...updateData, photoName };
    const resizedFileBuffer = await resizePhoto(req.file.buffer); // resize photo
    await uploadPhoto(photoName, resizedFileBuffer, req.file.mimetype); // upload photo
  }
  const photoEntry = await activeCollection.findOneAndUpdate({ _id: photoEntryID }, updateData, { // update entry
    new: true,
    runValidators: true
  });
  if (!photoEntry) return res.status(404).json({ success: true, message: `No entry with ID : ${photoEntryID}`});
  res.status(200).json({ success: true, photoEntry, message: `Entry is fetched successfully. ID: ${photoEntryID}`});
})
// DELETE photo entry 
const deletePhotoEntry = asyncWrapper(async (req, res) => {
  const { collection, photoEntryID } = req.params;
  const activeCollection = findActiveCollection(collection); // get active collection
  const fetchedPhotoEntry = await activeCollection.findOne({ _id: photoEntryID }); // get db single entry
  if (!fetchedPhotoEntry) return res.status(404).json({ success: false, message: `No photo entry with id : ${photoEntryID}` })
  await deletePhoto(fetchedPhotoEntry.photoName); // delete photo from storage
  const photoEntry = await activeCollection.findOneAndDelete({ _id: photoEntryID })
  if (!photoEntry) return res.status(404).json({ success: false, message: 'Entry does not exist'});
  res.status(200).json({ success: true, photoEntry, message: `Entry deleted successfully. ID: ${photoEntryID}` });
})

module.exports = { 
  getPhotoEntries,
  getSinglePhotoEntry,
  createPhotoEntry,
  deletePhotoEntry,
  updatePhotoEntry
};