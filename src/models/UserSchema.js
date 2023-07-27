const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  roles: {
    user: {
      type: Number,
      default: 2001
    },
    editor: {
      type: Number
    },
    admin: {
      type: Number
    },
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  downloadLimitCount: {
    type: Number,
    default: 0,
  },
  downloadCooldown: {
    type: Date,
    default: null,
  },
}, { timestamps: true }) 

module.exports = mongoose.model('User', UserSchema);