// TODO: handle functionality for auth user adding / removing photo entries from their collection 
const asyncWrapper = require('../middleware/asyncWrapper');
const UserPhotoEntryCollection = require('../models/UserPhotoEntryCollectionSchema');
var mongoose = require('mongoose'); // used to convert string to ObjectId

// filter passed in userID from collection
const getMatchedUser = async (userID) => {
  return await UserPhotoEntryCollection.findOne(userID);
} 

// CREATE/UPDATE photo entry 
const addPhotoEntryToCollection = asyncWrapper(async (req, res) => {
  // CHECK REQ BODY CONTENT
  const { userID, photoEntryID } = req.body ?? {};
  if(!userID || !photoEntryID) return res.status(400).json({message: 'User id and photo entry id are required'});
  // MATCH USER
  // query for existing user and db
  const filterUserID = {userID: userID}; // find doc by req body userID
  // const matchedUser = await UserPhotoEntryCollection.findOne(filterUserID);
  const matchedUser =  await getMatchedUser(filterUserID);
  // CREATE DOC
  // no user is matched -> new entry + add photo to collection
  if(!matchedUser) {
    const newUserCollection = await UserPhotoEntryCollection.create({userID, userCollection: [photoEntryID]});
    if(!newUserCollection) return res.status(400).json({success: false, message: 'Could not add photo entry to your collection'}) 
    res.status(200).json({success: true, message: 'Photo is successfully added to your collection'});
  }
  // UPDATE DOC
  // check if photo id is in the collection
  const { userCollection } = matchedUser ?? {}; // get userCollection
  const isDuplicatePhotoID = userCollection.find(photoID => photoID?.valueOf() === photoEntryID);
  // duplicate photo id: error res
  if(isDuplicatePhotoID) return res.status(403).json({success: false, message: 'Photo is already in your collection'});
  // update collection
  // define update parameters
  // 1. filterUserID (defined above)
  // 2. new data to upsert the userCollection with.  
  const convertToObjectID = mongoose.Types.ObjectId(photoEntryID); // convert req body photoEntryID to ObjectId 
  const newData = { 
    $addToSet: { // add only unique photo id's to array
      userCollection: convertToObjectID 
    }
  } 
  // 3. query options 
  const options = {
    new: true,
    runValidators: true
  }
  const updatedUserCollection = await UserPhotoEntryCollection.findOneAndUpdate(filterUserID, newData, options);
  if(!updatedUserCollection) return res.status(400).json({success: false, message: 'Could not add photo entry to your collection'}); 
  res.status(201).json({success: true, message: 'Photo is successfully added to your collection'});
})


// DELETE from collection
const removePhotoEntryFromCollection = asyncWrapper(async (req, res) => {
  // CHECK REQ BODY CONTENT
  const { userID, photoEntryID } = req.body ?? {};
  // MATCH USER IN COLLECTION
  const filterUserID = {userID: userID}; // find doc by req body userID
  // const matchedUser = await UserPhotoEntryCollection.findOne(filterUserID);
  const matchedUser = await getMatchedUser(filterUserID);
  if(!matchedUser) return res.sendStatus(404); // userID is not in the collection
  // FIND PHOTO IN DOCUMENT
  const { userCollection } = matchedUser ?? {}; // get userCollection
  const photoIDToDelete = userCollection.find(photoID => photoID?.valueOf() === photoEntryID);
  if(!photoIDToDelete) return res.sendStatus(404); // photoID is not in the collection
  // DELETE PhotoID (by updating the document)
  // define update parameters
  // 1. filterUserID (defined above)
  // 2. data to delete from userCollection.  
  const deleteData = { 
    $pull: { // remove photoID from array
      userCollection: photoEntryID // -> simple string form // photoIDToDelete -> ObjectID form)
    }
  } 
  // 3. query options 
  const options = {
    new: true,
    runValidators: true
  }
  const deletePhotoID = await UserPhotoEntryCollection.findOneAndUpdate(userID, deleteData, options);
  if(!deletePhotoID) return res.status(400).json({success: false, message: 'Could not remove photo entry from your collection'}); 
  res.status(201).json({success: true, message: 'Photo is successfully removed from your collection'});
})

module.exports = {
  addPhotoEntryToCollection,
  removePhotoEntryFromCollection,
}