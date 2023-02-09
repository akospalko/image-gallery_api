const mongoose = require('mongoose');

//Schema
const ImageEntrySchema = new mongoose.Schema({ 
  title: {
    type: String,
    required: true,
  }, 
  author: {
    type: String,
    required: true,
  }, 
  gps: {
    type: String,
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

module.exports = mongoose.model('ImageEntry', ImageEntrySchema)