// TODO handle photo entry like for auth user
// TODO: handle improper id format
// TODO: validate query params, strings
const asyncWrapper = require('../middleware/asyncWrapper');
// const UserPhotoEntryCollection = require('../models/UserPhotoEntryCollectionSchema');
const PhotoEntryGallery = require('../models/PhotoEntryGallerySchema');

// SHARED FUNCTIONALITIES
const options = { new: true, runValidators: true } // query options 

// UPDATE photo entry - ADD photo to user's collection 
const addLike = asyncWrapper(async (req, res) => {
  // get/confirm request data
  const { userID, photoEntryID } = req.params ?? {};
  if(!userID || !photoEntryID) return res.status(400).json({ message: 'User id and photo entry id are required' });
  const matchedPhotoEntry = await PhotoEntryGallery.findById(photoEntryID).lean(); // query for existing  photoEntry in Collection
  if(!matchedPhotoEntry) return res.status(404).json({ success: false, message: 'Photo entry does not exist' }) // photo entry with passed ID does not exist
  const { likes } = matchedPhotoEntry ?? {};
  const isDuplicatePhotoID = likes.find(id => id?.valueOf() === userID); // check if likes contains the req param's user id
  if(isDuplicatePhotoID) return res.status(403).json({ success: false, message: 'Photo is already liked' });  // userID is in likes: duplicate
  // update
  const queriedPhoto = await PhotoEntryGallery.findOneAndUpdate({ _id: photoEntryID }, { $addToSet: { likes: userID }}, options).lean(); 
  // handle unsuccessful update 
  if(!queriedPhoto) return res.status(400).json({ success: false, message: 'Could not like photo' }); 
  // create return data, process values
  const likesIDToString = queriedPhoto.likes.map(id => id.toString()) // make [] of userID's (type ObjectId) comparable by converting them to string
  const findUserCollection = likesIDToString.includes(userID); // check if userID is in photo entry's likes []
  const returnPhotoEntry = { _id: queriedPhoto._id }; // template for returning the required photo entry values (copy _id value, later pass in calculated values too (isLiked, likes))
  returnPhotoEntry.isLiked = findUserCollection; // bool: is the photo liked by the user
  returnPhotoEntry.likes = likesIDToString.length || 0; // int: how many user liked this photo
  // handle successful update
  res.status(200).json({ success: true, photoEntry: returnPhotoEntry, message: 'Photo is liked' });
})

// DELETE from collection
const removeLike = asyncWrapper(async (req, res) => {
  // get/confirm request data
  const { userID, photoEntryID } = req.params ?? {};
  const matchedPhotoEntry = await PhotoEntryGallery.findById(photoEntryID).lean();
  if(!matchedPhotoEntry) return res.status(404).json({ success: false, message: 'Photo entry does not exist' })
  // update
  const queriedPhoto = await PhotoEntryGallery.findOneAndUpdate({ _id: photoEntryID }, { $pull: { likes: userID }}, options).lean(); 
  // handle unsuccessful update
  if(!queriedPhoto) return res.status(400).json({ success: false, message: 'Could not remove like' }); 
  // create return data, process values
  const likesIDToString = queriedPhoto.likes.map(id => id.toString()) // make [] of userID's (type ObjectId) comparable by converting them to string
  const findUserCollection = likesIDToString.includes(userID); // check if userID is in photo entry's likes []
  const returnPhotoEntry = { _id: queriedPhoto._id }; // template for returning the required photo entry values (copy _id value, later pass in calculated values too (isLiked, likes))
  returnPhotoEntry.isLiked = findUserCollection; // bool: is the photo liked by the user
  returnPhotoEntry.likes = likesIDToString.length || 0; // int: how many user liked this photo
  // handle successful update
  res.status(200).json({ success: true, photoEntry: returnPhotoEntry, message: 'Like removed' });
})

module.exports = {
  addLike,
  removeLike
}