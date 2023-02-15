const User = require('../models/UserSchema');
const asyncWrapper = require('../middleware/asyncWrapper');
const bcrypt = require('bcrypt');

const loginUser = asyncWrapper(async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password)
  // credentials are not provided
  if(!username || !password) return res.status(401).json({message: 'Provide credentials'});
  // compare find username in db with req's username 
  const foundUser = await User.findOne({username: username});
  if(!foundUser) {
    return res.status(401).json({message: 'Incorrect username or password'}) // we should not provide the client if the username exists or not. We inform client that both username and password are incorrect
  }
  // compare user input and db passwords
  const matchedPassword = await bcrypt.compare(password, foundUser.password); 
  // create JWT
  if(matchedPassword) {
    return res.status(200).json({success: `${username} is logged in`});
  } else {
    return res.status(401).json({message: 'Incorrect username or password'});
  }
})

const getUsers = asyncWrapper(async (req, res) => {
  const users = await User.find({});
  if(!users) {
    return res.status(401).json({message: 'Users list is empty'})
  } 
  res.status(200).json({success: users})
})

module.exports = {loginUser, getUsers};