// handle functionality for auth-d user adding / removing photo entries to/from their collection 
// TODO: handle improper id format
const asyncWrapper = require('../middleware/asyncWrapper');
const UserPhotoEntryCollection = require('../models/UserPhotoEntryCollectionSchema');
const ImageEntryGallery = require('../models/ImageEntryGallerySchema');
const mongoose = require('mongoose'); // required to convert id string  to ObjectId

// SHARED FUNCTIONALITIES
// get userID from the Collection
const getMatchedUser = async (requestUserID) => {
  return await UserPhotoEntryCollection.findOne({userID : requestUserID});
}
// shared query parameters
const filterUserID = (userID) => {  // filter by: userID
  return { userID: userID } 
};
const options = { new: true, runValidators: true } // query options 

// CREATE/UPDATE photo entry 
const addPhotoIDToCollection = asyncWrapper(async (req, res) => {
  // get/confirm request data
  const { userID, photoEntryID } = req.body ?? {};
  if(!userID || !photoEntryID) return res.status(400).json({message: 'User id and photo entry id are required'});
  // query for existing userID in Collection
  const matchedUser =  await getMatchedUser(userID);
  // create new Document, add new photoID to the userCollection
  if(!matchedUser) { // user is not in the Collection 
    const newUserCollection = await UserPhotoEntryCollection.create({userID, userCollection: [photoEntryID]}); // create new document + add photoID to userCollection
    if(!newUserCollection) return res.status(400).json({success: false, message: 'Could not add photo entry to your collection'}) 
    res.status(200).json({success: true, message: 'Photo is successfully added to your collection'});
  }
  // prepare to update userCollection
  const { userCollection } = matchedUser ?? {}; // get userCollection
  const isDuplicatePhotoID = userCollection.find(photoID => photoID?.valueOf() === photoEntryID); // check if photo id is in the collection
  if(isDuplicatePhotoID) return res.status(403).json({success: false, message: 'Photo is already in your collection'}); // duplicate photo id
  // update userCollection
  const updatedUserCollection = await UserPhotoEntryCollection.findOneAndUpdate(filterUserID(userID), { $addToSet: { userCollection: mongoose.Types.ObjectId(photoEntryID) }}, options); // add unique photoID to array that is converted to ObjectId type 
  // handle update result
  if(!updatedUserCollection) return res.status(400).json({success: false, message: 'Could not add photo entry to your collection'}); 
  res.status(201).json({success: true, message: 'Photo is successfully added to your collection'});
})

// DELETE from collection
const removePhotoIDFromCollection = asyncWrapper(async (req, res) => {
  // get/confirm request data
  const { userID, photoEntryID } = req.body ?? {};
  // query for existing userID in Collection
  const matchedUser = await getMatchedUser(userID);
  if(!matchedUser) return res.sendStatus(404); // userID is not in the collection
  // find photoID in user Collection
  const { userCollection } = matchedUser ?? {}; // get userCollection
  const photoIDToDelete = userCollection.find(photoID => photoID?.valueOf() === photoEntryID);
  if(!photoIDToDelete) return res.sendStatus(404); // photoID is not in the collection
  // delete PhotoID (by updating the document)
  const deletePhotoID = await UserPhotoEntryCollection.findOneAndUpdate(filterUserID(userID), { $pull: { userCollection: photoEntryID } }, options);  // $pull -> removes photoID from array
  // handle update result
  if(!deletePhotoID) return res.status(400).json({success: false, message: 'Could not remove photo entry from your collection'}); 
  res.status(201).json({success: true, message: 'Photo is successfully removed from your collection'});
})

// GET USER COLLECTION PHOTOS
const getUserCollectionPhotoIDs = asyncWrapper(async (req, res) => {
  const { userID } = req.params ?? {};
  if (!userID) return sendStatus(401); // req userID is missing
  const matchedUser = await getMatchedUser(userID); // find user  
  if(!matchedUser) return res.status(404).json({success: false, message: 'You don\'t have a collection'}); // userID is not in the Collection 
  const { userCollection } = matchedUser ?? {}; // extract userCollection 
  if(userCollection.length < 1) return res.status(404).json({success: false, message: 'Your collection is empty'}); // userID is in the Collection, but user's photo collection is empty
  res.status(200).json({success: true, userCollection: userCollection, message: 'Fetching user collection was successful'}) // return user collection
})  

// TODO: GET specific photo entries from photo gallery collection and return it to the user 
const getUserCollectionPhotoEntries = asyncWrapper(async (req, res) => {
  // parse query string
  var userCollection = JSON.parse(req.query.userCollection); // array of photoID that belongs to the auth-d user
  console.log('user collection: ', userCollection);
  const photoEntries = await ImageEntryGallery.find({ '_id': { $in: userCollection } });
  console.log(photoEntries);
  res.status(200).json({ success: true, userCollection: photoEntries,  message: 'OK' }); 
  // TODO: filter data
  // TODO: handle query response, send back data
}) 

module.exports = {
  addPhotoIDToCollection,
  removePhotoIDFromCollection,
  getUserCollectionPhotoIDs,
  getUserCollectionPhotoEntries
}