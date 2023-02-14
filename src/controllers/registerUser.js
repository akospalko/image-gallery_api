const bcrypt = require('bcrypt');
const User = require('../models/UserSchema');
const asyncWrapper = require('../middleware/asyncWrapper')

const registerUser = asyncWrapper(async (req, res) => {
  const {email, username, password} = req.body;
  // check for valid credentials
  if(!email || !username || !password) return res.status(400).json('Credentials are required.');
  // check for duplicate email/username in the db
  const queryEmail = await User.findOne({email: email});
  const queryUsername = await User.findOne({username: username});
  // if either email or username is found in db return error response
  if(queryEmail) return res.status(409).json({message: 'e-mail already exists'});
  if(queryUsername) return res.status(409).json({message: 'username already exists'});
  try {
    // hash pw using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    // create user credentials
    const userCredentials = {email, username, password: hashedPassword}; 
    // post new user
    const newUser = await User.create(userCredentials); 
    res.status(201).json({success: `Created new user: ${username}`}); 
  } catch(error) {
    return res.status(500).json({message: error.message})
  }
})

module.exports = {
  registerUser
}