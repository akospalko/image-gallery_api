// TODO: handle improper id format
// add / remove photo like  
const asyncWrapper = require('../../middleware/asyncWrapper');
const PhotoEntryGallery = require('../../models/PhotoEntryGallerySchema');
const { modifyPhotoEntrySingleParameter } = require('../../helper/modifyQueriedPhoto');

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
  const addToCollection = await PhotoEntryGallery.findOneAndUpdate({ _id: photoEntryID }, { $addToSet: { inCollection: userID }}, options).lean(); 
  // handle unsuccessful update 
  if(!addToCollection) return res.status(400).json({ success: false, message: 'Could not add photo to your collection' }); 
  // create return data, process values
  const returnPhotoEntry = modifyPhotoEntrySingleParameter(addToCollection, userID, 'isInCollection', 'inCollection');
  res.status(200).json({ success: true, photoEntry: returnPhotoEntry, message: 'Photo is added to your collection' });
})

// DELETE from collection
const removePhotoEntryFromCollection = asyncWrapper(async (req, res) => {
  // get/confirm request data
  const { userID, photoEntryID } = req.params ?? {};
  const matchedPhotoEntry = PhotoEntryGallery.findOne({ _id: photoEntryID }).lean();
  if(!matchedPhotoEntry) return res.status(404).json({ success: false, message: 'Photo entry does not exist' })
  const removeFromCollection = await PhotoEntryGallery.findOneAndUpdate({ _id: photoEntryID }, { $pull: { inCollection: userID }}, options); 
  // handle unsuccessful update
  if(!removeFromCollection) return res.status(400).json({ success: false, message: 'Could not remove photo from your collection' }); 
  // create return data, process values
  const returnPhotoEntry = modifyPhotoEntrySingleParameter(removeFromCollection, userID, 'isInCollection', 'inCollection');
  res.status(200).json({ success: true, photoEntry: returnPhotoEntry, message: 'Photo is removed from your collection' });
})

module.exports = {
  addPhotoEntryToCollection,
  removePhotoEntryFromCollection,
}