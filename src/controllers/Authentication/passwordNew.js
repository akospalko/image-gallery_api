const asyncWrapper = require('../../middleware/asyncWrapper');
const User = require('../../models/UserSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const checkLinkValidity = asyncWrapper(async (req, res) => {
  res.json({success: true, message: 'check link validity test'});
})
const createNewPassword = asyncWrapper(async (req, res) => {
  res.json({success: true, message: 'create pw test'});
})

module.exports = { createNewPassword, checkLinkValidity }; 