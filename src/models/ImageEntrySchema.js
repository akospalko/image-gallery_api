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
  coordinate: {
    type: [String],
  }, 
  description: {
    type: String,
  },
  // date: {
  //   type: Date,
  //   default: () => Date.now(),
  // },
  imageURL: {
    type: String,
    required: true,
    default: 'test.jpg',
  },
})

module.exports = mongoose.model('ImageEntry', ImageEntrySchema)