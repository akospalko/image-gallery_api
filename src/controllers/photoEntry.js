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
  const { userID } = req.query;
  const activeCollection = findActiveCollection(collection); // get active collection
  const photoEntries = await activeCollection.find({}).lean(); // get database entry as a plain object (.lean()) -> converts mongoose doc to plain obj -> allows to add properties to the obj (e.g. photoURL);
  if(!photoEntries) return res.status(404).json({ success: false, message: 'Couldn\'t fetch entries' });   // if unsuccessful return error message
  const returnPhotoEntries = photoEntries.map(entry => { // return bool values for inCollection/likes states  
    // handle collection
    const collectionIDToString = entry.inCollection.map(id => id.toString()) // convert inCollection[] object id-s to strings[] 
    const isCollectionized = collectionIDToString.includes(userID); // check for auth-d user's collectionized photos (photos added to collection) 
    entry.isInCollection = isCollectionized // is the photo entry in the user's collection
    entry.inCollection = collectionIDToString.length || 0; 
    // handle likes 
    const likesIDToString = entry.likes.map(id => id.toString()) // convert inCollection[] object id-s to strings[]   
    const isEntryLiked = likesIDToString.includes(userID); // check if entry.likes [], contains the userID (user liked the photo)   
    entry.isLiked = isEntryLiked;
    entry.likes = likesIDToString.length || 0; 
    return entry;
  })
  await getStorageSignedURL(returnPhotoEntries); // get each fetched entry's photo name and create signed url for them (by passing photo name to the getObjectParams' key prop).  
  res.status(200).json({ success: true, photoEntries: returnPhotoEntries, message: 'All entries were successfully fetched' }); 
})
// GET single entry
// const getSinglePhotoEntry = asyncWrapper(async (req, res) => {
//   const { collection, photoEntryID } = req.params; 
//   const { userID } = req.query;
//   // console.log('uID', userID, 'eID', photoEntryID, collection);
//   const activeCollection = findActiveCollection(collection); // get active collection
//   const photoEntry = await activeCollection.findOne({ _id: photoEntryID }).lean(); // get db entry as plain object
//   if (!photoEntry) return res.status(404).json({ success: false, message: `Entry was not found. ID: ${ photoEntryID }` });
//   // TODO: convert inCollection and likes fields to return a boolean value
//   const collectionIDToString = photoEntry.inCollection.map(id => id.toString()) // check if entry.inCollection, contains userID
//   const findUserCollection = collectionIDToString.includes(userID); // check if userID is in photo entry's inCollection
//   const returnPhotoEntry = {...photoEntry};
//   if(findUserCollection) { // is the photo entry in the user's collection
//     returnPhotoEntry.isInCollection = true ; 
//   } else {
//     returnPhotoEntry.isInCollection = false; 
//   }
//   returnPhotoEntry.inCollection = collectionIDToString.length && collectionIDToString.length >= 1 ? collectionIDToString.length : 0; 
//   returnPhotoEntry.likes = 0; // dummy value
//   returnPhotoEntry.isLiked = false; // dummy value

//   // await getStorageSignedURL(returnPhotoEntry); // get signed url, assign  value to photoURL field  
//   res.status(200).json({ success: true, photoEntry: returnPhotoEntry, message: `Entry is fetched successfully. ID: ${ photoEntryID }` });
// })

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
  getAllPhotoEntries,
  getSinglePhotoEntry,
  createPhotoEntry,
  deletePhotoEntry,
  updatePhotoEntry
};