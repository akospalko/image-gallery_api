const User = require('../models/UserSchema');
const asyncWrapper = require('../middleware/asyncWrapper');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const refreshToken = asyncWrapper(async (req, res) => {
  const cookies = req.cookies;
  if(!cookies?.jwt) return res.status(401).json({message: 'Refresh token is missing'}); // jwt cookie is not provided
  const refreshToken = cookies.jwt;

  // compare found refresh token in db with req's refresh token 
  const foundUser = await User.findOne({refreshToken});
  if(!foundUser) {
    return res.status(403).json({message: 'User does not have access to this resource'}) // we should not provide the client if the username exists or not. We inform client that both username and password are incorrect
  }
  // evaluate refresh token
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    (error, decoded) => {
      if(error || decoded.username !== foundUser.username) return res.status(403).json({message: 'Error while validating your access'}) 
      const accessToken = jwt.sign(
        {'username': decoded.username}, 
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {expiresIn: '30s'}
      )
      res.status(200).json({accessToken});
    }
  )
})

module.exports = {refreshToken};