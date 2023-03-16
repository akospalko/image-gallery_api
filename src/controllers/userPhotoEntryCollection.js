// TODO: handle improper id format
const asyncWrapper = require('../middleware/asyncWrapper');
// const UserPhotoEntryCollection = require('../models/UserPhotoEntryCollectionSchema');
const PhotoEntryGallery = require('../models/PhotoEntryGallerySchema');
const { ObjectId } = require('mongodb')

const { 
  getStorageSignedURL
} = require('../middleware/storage');

// SHARED FUNCTIONALITIES
const options = { new: true, runValidators: true } // query options 

// UPDATE photo entry - ADD photo to user's collection 
const addPhotoEntryToCollection = asyncWrapper(async (req, res) => {
  // get/confirm request data
  const { userID, photoEntryID } = req.params ?? {};
  if(!userID || !photoEntryID) return res.status(400).json({ message: 'User id and photo entry id are required' });
  const matchedPhotoEntry = await PhotoEntryGallery.findById(photoEntryID).exec();  // query for existing  photoEntry in Collection
  if(!matchedPhotoEntry) return res.status(404).json({ success: false, message: 'Photo entry does not exist' }) // photo entry with passed ID does not exist
  const { inCollection } = matchedPhotoEntry ?? {};
  const isDuplicatePhotoID = inCollection.find(id => id?.valueOf() === userID); // check if inCollection contains the req param's user id
  if(isDuplicatePhotoID) return res.status(403).json({ success: false, message: 'Photo is already in your collection' });  // userID is in inCollection: duplicate
  const addToUserCollection = await PhotoEntryGallery.findOneAndUpdate({ _id: photoEntryID }, { $addToSet: { inCollection: userID }}, options); 
  // handle update result
  if(!addToUserCollection) return res.status(400).json({ success: false, message: 'Could not add photo to your collection' }); 
  res.status(201).json({ success: true, message: 'Photo is added to your collection' });
})

// DELETE from collection
const removePhotoEntryFromCollection = asyncWrapper(async (req, res) => {
  // get/confirm request data
  const { userID, photoEntryID } = req.params ?? {};
  const matchedPhotoEntry = PhotoEntryGallery.findOne({ _id: photoEntryID });
  if(!matchedPhotoEntry) return res.status(404).json({ success: false, message: 'Photo entry does not exist' })
  const removeFromUserCollection = await PhotoEntryGallery.findOneAndUpdate({ inCollection: userID }, { $pull: { inCollection: userID }}, options); 
  // handle update result
  if(!removeFromUserCollection) return res.status(400).json({ success: false, message: 'Could not remove photo from your collection' }); 
  res.status(201).json({ success: true, message: 'Photo is removed from your collection' });
})
 
// GET all the photo entries from the user collection
// const getSingleCollectionEntry = asyncWrapper (async (req, res) => {
//   const { userID, í } = req.params ?? {};
//   if (!userID) return sendStatus(401); // req userID is missing
//   // find photoEntry
//   const photoEntries = await PhotoEntryGallery.find({ 'inCollection' : { $in: userID } }); 
//   if (!photoEntries) return res.status(404).json({ success: false, message: "Couldn't find entries"});
//   const { inCollection } = photoEntries;
//   if(inCollection?.length < 1) return res.status(404).json({ success: false, message: 'Your collection is empty' }); // photo entries exist, but they are not in user's photo collection
//   res.status(200).json({ success: true, message: 'Fetching user collection was successful' }); 
// })

// GET, returns all entries from the user's collection (the returned data is used in user's own collection).
const getUserCollection = asyncWrapper (async (req, res) => {
  const { userID } = req.params ?? {};
  if (!userID) return sendStatus(401); // req userID is missing
  // find photoEntry
  const photoEntries = await PhotoEntryGallery.find({ 'inCollection' : { $in: userID } }).lean(); 
  if (!photoEntries) return res.status(404).json({ success: false, message: 'Your collection is empty' });
  const returnPhotoEntries = photoEntries.map(entry => { // calculate isInCollection, isLiked values, remove unecessary values: inCollection, likes
    entry.isInCollection = true;
    entry.isLiked = false;
    delete entry.inCollection;
    delete entry.likes; 
    return entry;
  })
  await getStorageSignedURL(photoEntries); // get each fetched entry's photo name and create signed url for them
  res.status(200).json({ success: true, photoEntries: returnPhotoEntries, message: 'Fetching user collection was successful' });
})

// // GET PHOTO ENTRIES or PHOTO ENTRIES ID from USER'S COLLECTION 
// const getUserCollectionPhotoEntries = asyncWrapper(async (req, res) => {
//   const { userID } = req.params ?? {};
//   const { getPhotoEntries } = req.query;
//   if (!userID) return sendStatus(401); // req userID is missing
//   const queryStringToBool = (value) => {
//     if(!value) return;
//     return ((value+'').toLowerCase() === 'true')
//   }
//   // query user
//   const matchedUser = await getMatchedUser(userID); // find user  
//   if(!matchedUser) return res.status(404).json({ success: false, message: 'You don\'t have a collection' }); // userID is not in the Collection 
//   const { userCollection } = matchedUser ?? {}; // extract userCollection 
//   if(userCollection.length < 1) return res.status(404).json({success: false, message: 'Your collection is empty'}); // userID is in the Collection, but user's photo collection is empty
//   // query data:
//   let getPhotoEntriesCondition = queryStringToBool(getPhotoEntries) // check && convert query param value
//   // return photoEntriesID
//   if(!getPhotoEntriesCondition) return res.status(200).json({ success: true, userCollection: userCollection, message: 'Fetching collection ID-s were successful' }); 
//   // return photoEntries
//   const photoEntries = await PhotoEntryGallery.find({ '_id': { $in: userCollection } }); // find photo entries in gallery Collection 
//   if (!photoEntries) return res.status(404).json({ success: false, message: "Couldn't find entries"});
//   res.status(200).json({ success: true, userCollection: photoEntries,  message: 'Fetching user collection was successful' }); 
// }) 

module.exports = {
  addPhotoEntryToCollection,
  removePhotoEntryFromCollection,
  // getSingleCollectionEntry,
  getUserCollection,
  // getUserCollectionPhotoEntries
}