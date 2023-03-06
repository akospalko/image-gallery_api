// TODO: handle functionality for auth user adding / removing photo entries from their collection 
const asyncWrapper = require('../middleware/asyncWrapper');
const UserPhotoEntryCollection = require('../models/UserPhotoEntryCollectionSchema');

// TODO: photo entry to collection
const addPhotoEntryToCollection = asyncWrapper(async (req, res) => {
  const { userID, userCollection } = req.body;
  res.status(200).json({success: true, userID, userCollection,  message: 'Photo is successfully added to your collection'});
}) 

// remove from collection
const removePhotoEntryFromCollection = asyncWrapper(async (req, res) => {
  res.status(200).json({success: true, message: 'Photo is successfully liked'});
})

module.exports = {
  addPhotoEntryToCollection,
  removePhotoEntryFromCollection,
}