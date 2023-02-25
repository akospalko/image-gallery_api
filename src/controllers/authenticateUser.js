const User = require('../models/UserSchema');
const asyncWrapper = require('../middleware/asyncWrapper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const loginUser = asyncWrapper(async (req, res) => {
  const { username, password } = req.body;
  // credentials are not provided
  if(!username || !password) return res.status(400).json({success: false, message: 'Provide credentials'});
  // compare find username in db with req's username 
  const foundUser = await User.findOne({username: username}).exec();
  if(!foundUser) return res.status(401).json({success: false, message: 'Incorrect username or password'}) // we should not provide the client if the username exists or not. We inform client that both username and password are incorrect
  // compare user input and db passwords
  const matchedPassword = await bcrypt.compare(password, foundUser.password); 
  if(matchedPassword) {
    // store current user's roles (their code) which we will pass to the access token
    const roles = Object.values(foundUser.roles); 
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username, // payload with the specified/ relevant info object (don't provide password in case somebody gets an access to the token ) 
          roles // store roles by their code 
        }
      },
      process.env.JWT_ACCESS_TOKEN_SECRET, // access token's secret key  
      { expiresIn: '15s' } // expiry date, production mode: 5-10min 
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username }, 
      process.env.JWT_REFRESH_TOKEN_SECRET, 
      { expiresIn: '5h' } // refresh tokens usually has much larger expiry time 
    );
    // update current user's document with the refresh token
    foundUser.refreshToken = refreshToken;
    const updatedUser = await foundUser.save();
    // send secure cookie (http only) with the refresh token to the client cookie
    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 }); // duration: 1d  
    // send success message and access token to user
    res.status(200).json({success: true, message: `Success. ${username} is logged in`, roles, accessToken});
  } else {
    res.status(401).json({success: true, message: 'Incorrect username or password '});
  }
})

module.exports = {loginUser};