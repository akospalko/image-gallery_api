
// apply changes to and return queried photo entry doc. to client with some modification to the original one.
// used with photo-user-collection, photo-user-like and collection/like initial state getters (gallery/user collection) 

// NOTE
/*queriedPhoto: filtered document that is to be modify and returned to the client 
  userID: currently authenticated user's ID
  newly added object parameter key names:
  currentUserToggleStateKey: isLiked, isInCollection -> current user toggle states
  usersArrayKey: likes, inCollection -> num of users liked the photo or collectionized the photo */
  
  // modify photo entry's single parameter
  const modifyPhotoEntrySingleParameter = (photoEntry, userID, currentUserToggleStateKey, usersArrayKey) => {
  const ObjectIDToString = photoEntry[usersArrayKey].map(id => id.toString()) // make [] of userID's (type ObjectId) comparable by converting them to string
  const isUserFound = ObjectIDToString.includes(userID); // find out if auth-d user is in the usersArrayKey
  const updatedPhotoEntry = { _id: photoEntry._id }; // container for updated photo entry, initialized with queried photo' ID 
  updatedPhotoEntry[currentUserToggleStateKey] = isUserFound; // bool: toggle state for current user (isLiked/ isInCollection)
  updatedPhotoEntry[usersArrayKey] = ObjectIDToString.length || 0; // int: amount of users liked/collectionized the queried photo)
  return updatedPhotoEntry; // {_id: photo-entry-id, isLiked/isInCollection: true/false, likes/inCollection: 5}
}

// modify photo entry's multiple parameters
// used in getters(get all gallery || user collection photos), where we change both like and collection data with one request 
const modifyPhotoEntryMultipleParameter = (photoEntries, userID) => {
  return photoEntries.map(entry => { // return bool values for inCollection/likes states  
    // modify fetched doc's like related data 
    const modifyCollectionParameters = modifyPhotoEntrySingleParameter(entry, userID, 'isInCollection', 'inCollection');
    const {isInCollection, inCollection} = modifyCollectionParameters;
    // modify collection related data 
    const modifyLikeParameters = modifyPhotoEntrySingleParameter(entry, userID, 'isLiked', 'likes');
    const {isLiked, likes} = modifyLikeParameters;
    // merge and return parameters 
    const mergedParameters = { ...entry, isInCollection, inCollection, isLiked, likes }; 
    return mergedParameters;
  })
}

module.exports = {
  modifyPhotoEntrySingleParameter,
  modifyPhotoEntryMultipleParameter
};