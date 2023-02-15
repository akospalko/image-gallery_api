const User = require('../models/UserSchema');
const asyncWrapper = require('../middleware/asyncWrapper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
  if(matchedPassword) {
    // create JWTs
    const accessToken = jwt.sign(
      {'username': foundUser.username }, // payload with the specified/ relevant info object (don't provide password in case somebody gets an access to the token ) 
      process.env.JWT_ACCESS_TOKEN_SECRET, // access token's secret key  
      {expiresIn: '30s'} // expiry date, production mode: 5-10min 
    )
    const refreshToken = jwt.sign(
      {'username': foundUser.username }, 
      process.env.JWT_REFRESH_TOKEN_SECRET, 
      {expiresIn: '1d'} // refresh tokens usually has much larger expiry time 
    )
    // update current user's document with the refresh token
    foundUser.refreshToken
    const updatedUser = await foundUser.save();
    console.log('updated user:', updatedUser);
    // send secure cookie (http only) with the refresh token to the client  cookie
    res.cookie('jwt', refreshToken, 24 * 60 * 60 * 1000) // duration: 1d  
    return res.status(200).json({success: `${username} is logged in`, accessToken});
  } else {
    return res.status(401).json({message: 'Incorrect username or password'});
  }
})

// get list of users only for testing
const getUsers = asyncWrapper(async (req, res) => {
  const users = await User.find({});
  if(!users) {
    return res.status(401).json({message: 'Users list is empty'})
  } 
  res.status(200).json({success: users})
})

module.exports = {loginUser, getUsers};