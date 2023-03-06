const User = require('../models/UserSchema');
const asyncWrapper = require('../middleware/asyncWrapper');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const refreshToken = asyncWrapper(async (req, res) => {
  const cookies = req.cookies;
  if(!cookies?.jwt) return res.status(401).json({ success: false, message: 'Refresh token is missing' }); // jwt cookie is not provided
  const refreshToken = cookies.jwt;
  
  // compare found refresh token in db with req's refresh token 
  const foundUser = await User.findOne({refreshToken}).exec();
  if(!foundUser) return res.status(403).json({ success: false, message: 'User does not have access to this resource' }) // we should not provide the client if the username exists or not. We inform client that both username and password are incorrect
  // evaluate refresh token
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    (error, decoded) => {
      if(error || decoded.username !== foundUser.username) return res.status(403).json({ success: false, message: 'Error while validating your access token' }); 
      // store current user's roles (their code) which we will pass to the access token
      const roles = Object.values(foundUser.roles);
      // const roles = Object.keys(foundUser.roles);
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: decoded.username,
            roles: roles
          }, 
        },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: '60s' }
      )
      res.status(200).json({ success: true, roles, accessToken, message: 'Generating new access token was successfull' });
    }
  )
})

module.exports = {refreshToken};