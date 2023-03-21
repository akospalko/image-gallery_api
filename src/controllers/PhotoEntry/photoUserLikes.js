// TODO: handle improper id format 
// Photo entry like functionalities for auth-d user: add and remove like
const asyncWrapper = require('../../middleware/asyncWrapper');
const PhotoEntryGallery = require('../../models/PhotoEntryGallerySchema');
const { modifyPhotoEntrySingleParameter } = require('../../helper/modifyQueriedPhoto');

// SHARED FUNCTIONALITIES
const options = { new: true, runValidators: true } // query options 

// UPDATE, Like photo 
const addLikeToPhotoEntry = asyncWrapper(async (req, res) => {
  // get/confirm request data
  const { userID, photoEntryID } = req.params ?? {};
  if(!userID || !photoEntryID) return res.status(400).json({ message: 'User id and photo entry id are required' });
  const matchedPhotoEntry = await PhotoEntryGallery.findById(photoEntryID).lean(); // query for existing  photoEntry in Collection
  if(!matchedPhotoEntry) return res.status(404).json({ success: false, message: 'Photo entry does not exist' }) // photo entry with passed ID does not exist
  const { likes } = matchedPhotoEntry ?? {};
  const isDuplicatePhotoID = likes.find(id => id?.valueOf() === userID); // check if likes contains the req param's user id
  if(isDuplicatePhotoID) return res.status(403).json({ success: false, message: 'Photo is already liked' });  // userID is in likes: duplicate
  // update
  const addLike = await PhotoEntryGallery.findOneAndUpdate({ _id: photoEntryID }, { $addToSet: { likes: userID }}, options).lean(); 
  // handle unsuccessful update 
  if(!addLike) return res.status(400).json({ success: false, message: 'Could not like photo' }); 
  // create return data, process values
  const returnPhotoEntry = modifyPhotoEntrySingleParameter(addLike, userID, 'isLiked', 'likes');
  res.status(200).json({ success: true, photoEntry: returnPhotoEntry, message: 'Photo is liked' });
})

// DELETE, remove like from photo 
const removeLikeFromPhotoEntry = asyncWrapper(async (req, res) => {
  // get/confirm request data
  const { userID, photoEntryID } = req.params ?? {};
  if(!userID || !photoEntryID) return res.status(400).json({ message: 'User id and photo entry id are required' });
  // find photo enry to update
  const matchedPhotoEntry = await PhotoEntryGallery.findById(photoEntryID).lean();
  if(!matchedPhotoEntry) return res.status(404).json({ success: false, message: 'Photo entry does not exist' })
  // update
  const removeLike = await PhotoEntryGallery.findOneAndUpdate({ _id: photoEntryID }, { $pull: { likes: userID }}, options).lean(); 
  if(!removeLike) return res.status(400).json({ success: false, message: 'Could not remove like' }); 
  // create return data, process values
  const returnPhotoEntry = modifyPhotoEntrySingleParameter(removeLike, userID, 'isLiked', 'likes');
  res.status(200).json({ success: true, photoEntry: returnPhotoEntry, message: 'Like removed' });
})

module.exports = {
  addLikeToPhotoEntry, 
  removeLikeFromPhotoEntry
}