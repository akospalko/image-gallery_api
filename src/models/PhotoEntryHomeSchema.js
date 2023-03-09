const mongoose = require('mongoose');

// Schema for photo entry home page carousel 
const PhotoEntryHomeSchema = new mongoose.Schema({ 
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
},   
{ timestamps: true }
)

module.exports = mongoose.model('PhotoEntryHome', PhotoEntryHomeSchema)