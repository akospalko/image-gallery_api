// TODO: handle improper id format
const asyncWrapper = require('../middleware/asyncWrapper');
// const UserPhotoEntryCollection = require('../models/UserPhotoEntryCollectionSchema');
const PhotoEntryGallery = require('../models/PhotoEntryGallerySchema');

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
  const addToUserCollection = await PhotoEntryGallery.findOneAndUpdate({ _id: photoEntryID }, { $addToSet: { inCollection: userID }}, options).lean(); 
  // handle unsuccessful update 
  if(!addToUserCollection) return res.status(400).json({ success: false, message: 'Could not add photo to your collection' }); 
  // create return data, process values
  const collectionIDToString = addToUserCollection.inCollection.map(id => id.toString()) // make [] of userID's (type ObjectId) comparable by converting them to string
  const findUserCollection = collectionIDToString.includes(userID); // check if userID is in photo entry's inCollection: photo is in user' collection
  const returnPhotoEntry = { _id: addToUserCollection._id }; // template for returning the required photo entry values (copy _id value, later pass in calculated values too (isInCollection, inCollection))
  returnPhotoEntry.isInCollection = findUserCollection ? true : false; // bool: is the photo entry in the user's collection
  returnPhotoEntry.inCollection = collectionIDToString.length && collectionIDToString.length >= 1 ? collectionIDToString.length : 0; // int: how many user have this photo entry in their collection
  // handle successful update
  res.status(200).json({ success: true, photoEntry: returnPhotoEntry, message: 'Photo is added to your collection' });
})

// DELETE from collection
const removePhotoEntryFromCollection = asyncWrapper(async (req, res) => {
  // get/confirm request data
  const { userID, photoEntryID } = req.params ?? {};
  const matchedPhotoEntry = PhotoEntryGallery.findOne({ _id: photoEntryID }).lean();
  if(!matchedPhotoEntry) return res.status(404).json({ success: false, message: 'Photo entry does not exist' })
  const removeFromUserCollection = await PhotoEntryGallery.findOneAndUpdate({ inCollection: userID }, { $pull: { inCollection: userID }}, options); 
  // handle unsuccessful update
  if(!removeFromUserCollection) return res.status(400).json({ success: false, message: 'Could not remove photo from your collection' }); 
  // create return data, process values
  const collectionIDToString = removeFromUserCollection.inCollection.map(id => id.toString()) // make [] of userID's (type ObjectId) comparable by converting them to string
  const findUserCollection = collectionIDToString.includes(userID); // check if userID is in photo entry's inCollection: photo is in user' collection
  const returnPhotoEntry = { _id: removeFromUserCollection._id }; // template for returning the required photo entry values (copy _id value, later pass in calculated values too (isInCollection, inCollection))
  returnPhotoEntry.isInCollection = findUserCollection ? true : false; // bool: is the photo entry in the user's collection
  returnPhotoEntry.inCollection = collectionIDToString.length && collectionIDToString.length >= 1 ? collectionIDToString.length : 0; // int: how many user have this photo entry in their collection
  // handle successful update
  res.status(200).json({ success: true, photoEntry: returnPhotoEntry, message: 'Photo is removed from your collection' });
})

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

module.exports = {
  addPhotoEntryToCollection,
  removePhotoEntryFromCollection,
  getUserCollection,
}