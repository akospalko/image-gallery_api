// version where collection ID-s are stored in photoEntry collection  
// handle functionality for auth-d user adding/removing photoIDs to/from their collection && fetching photo entries based on the stored photoIDs   
// TODO: handle improper id format
// TODO: rename controlers
const asyncWrapper = require('../middleware/asyncWrapper');
const UserPhotoEntryCollection = require('../models/UserPhotoEntryCollectionSchema');
const PhotoEntryGallery = require('../models/PhotoEntryGallerySchema');

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
  const { userID, photoEntryID } = req.params ?? {};
  console.log(userID, photoEntryID);
  if(!userID || !photoEntryID) return res.status(400).json({message: 'User id and photo entry id are required'});
  // query for existing  photoEntry in Collection
  const matchedPhotoEntry = await PhotoEntryGallery.findOne({_id: photoEntryID});
  // check for existing photo entry
  if(!matchedPhotoEntry) return res.status(404).json({success: false, message: 'Photo entry does not exist'}) // photo entry with this ID does not exist
  // check if photo is in user's collection
  const matchedUser = await PhotoEntryGallery.findOne({inCollection: userID});
  // userID is in inCollection: duplicate
  if(matchedUser) return res.status(403).json({success: false, message: 'Photo is already in your collection'}); // duplicate photoID
  // userID is in not inCollection: add userID to inCollection
  // TODO: just update, pass matchedUser as param 
   const addToUserCollection = await PhotoEntryGallery.updateOne({ $addToSet: { inCollection: userID }}, options); 
  //  const addToUserCollection = await PhotoEntryGallery.findOneAndUpdate({ inCollection: userID }, { $addToSet: { userCollection: photoEntryID }}, options); 
  // handle update result
  if(!addToUserCollection) return res.status(400).json({success: false, message: 'Could not add photo to your collection'}); 
  res.status(201).json({success: true, message: 'Photo is successfully added to your collection'});
})



// TODO: REWORK
// DELETE from collection
const removePhotoIDFromCollection = asyncWrapper(async (req, res) => {
  // get/confirm request data
  const { userID, photoEntryID } = req.params ?? {};
  // const { userID, photoEntryID } = req.body ?? {};
  console.log(userID, photoEntryID);
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
  res.status(200).json({success: true, message: 'Photo is successfully removed from your collection'});
})
// GET PHOTO ENTRIES or PHOTO ENTRIES ID from USER'S COLLECTION 
const getUserCollectionPhotoEntries = asyncWrapper(async (req, res) => {
  const { userID } = req.params ?? {};
  const { getPhotoEntries } = req.query;
  if (!userID) return sendStatus(401); // req userID is missing
  // convert && validate query string 
  const queryStringToBool = (value) => {
    if(!value) return;
    return ((value+'').toLowerCase() === 'true')
  }
  // query user
  const matchedUser = await getMatchedUser(userID); // find user  
  if(!matchedUser) return res.status(404).json({success: false, message: 'You don\'t have a collection'}); // userID is not in the Collection 
  const { userCollection } = matchedUser ?? {}; // extract userCollection 
  if(userCollection.length < 1) return res.status(404).json({success: false, message: 'Your collection is empty'}); // userID is in the Collection, but user's photo collection is empty
  // query data:
  let getPhotoEntriesCondition = queryStringToBool(getPhotoEntries) // check && convert query param value
  // return photoEntriesID
  if(!getPhotoEntriesCondition) return res.status(200).json({ success: true, userCollection: userCollection, message: 'Fetching collection ID-s were successful' }); 
  // return photoEntries
  const photoEntries = await PhotoEntryGallery.find({ '_id': { $in: userCollection } }); // find photo entries in gallery Collection 
  if (!photoEntries) return res.status(404).json({ success: false, message: "Couldn't find entries"});
  res.status(200).json({ success: true, userCollection: photoEntries,  message: 'Fetching user collection was successful' }); 
}) 

module.exports = {
  addPhotoIDToCollection,
  removePhotoIDFromCollection,
  getUserCollectionPhotoEntries
}
