const mongoose = require('mongoose');

// Schema for photo gallery 
const PhotoEntryGallerySchema = new mongoose.Schema({ 
  title: {
    type: String,
    required: true,
  }, 
  author: {
    type: String,
    required: true,
  }, 
  gpsLatitude: {
    type: Number,
  }, 
  gpsLongitude: {
    type: Number,
  }, 
  description: {
    type: String,
  },
  captureDate: {
    type: String,
  },
  photoName: {
    type: String,
    required: true,
  }, 
  inCollection: {
    type: [mongoose.Schema.Types.ObjectId]
  }, 
  likes: {
    type: [mongoose.Schema.Types.ObjectId]
  },
  downloads: {
    type: Number,
    default: 0,
  }
}, { timestamps: true } )

module.exports = mongoose.model('PhotoEntryGallery', PhotoEntryGallerySchema)