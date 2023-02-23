const bcrypt = require('bcrypt');
const User = require('../models/UserSchema');
const asyncWrapper = require('../middleware/asyncWrapper')

const registerUser = asyncWrapper(async (req, res) => {
  const {email, username, password} = req.body;
  // check for valid credentials
  if(!email || !username || !password) return res.status(400).json({ success: false, message:'Credentials are required.' });
  // check for duplicate email/username in the db
  const queryEmail = await User.findOne({ email: email });
  const queryUsername = await User.findOne({ username: username });
  // if either email or username is found in db return error response
  if(queryEmail) return res.status(409).json({ success: false, message: 'e-mail already exists' });
  if(queryUsername) return res.status(409).json({ success: false, message: 'username already exists' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);    // hash pw using bcrypt
    const userCredentials = { email, username, roles: { user: 2001 }, password: hashedPassword }; // create user credentials 
    await User.create(userCredentials);    // post new user 
    res.status(201).json({ success: true, message: `Created new user: ${username}` }); 
  } catch(error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = {
  registerUser
}