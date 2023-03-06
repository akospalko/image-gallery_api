// schema & model for db to store users' interactions with the photo entries (add to my collection, like)    
const mongoose = require('mongoose');

const UserPhotoCollectionSchema = new mongoose.Schema( {
  userID: { // register user's id
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userCollection: { // array of photo entry object id's the auth-d user added to their collection 
    type: [mongoose.Schema.Types.ObjectId],
    required: true
  },
  userLikes: { // array of photo entry object id's the auth-d user liked
    type: [mongoose.Schema.Types.ObjectId],
    required: true
  }  
})

module.exports = mongoose.model('UserPhotoEntryCollection', UserPhotoCollectionSchema); 