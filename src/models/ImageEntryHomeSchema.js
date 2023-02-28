const mongoose = require('mongoose');

//Schema for img entry home page photo carousel 
const ImageEntryHomeSchema = new mongoose.Schema({ 
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
  imageName: {
    type: String,
    required: true,
  }, 
},   
{ timestamps: true }
)

module.exports = mongoose.model('ImageEntryHome', ImageEntryHomeSchema)