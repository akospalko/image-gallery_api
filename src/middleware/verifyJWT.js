// verify access token secret key coming from client side (req.headers.authorization)
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({success: false, message: 'Unauthorized. Token is missing'});
  const token = authHeader.split(' ')[1];
  // verify token
  jwt.verify(
    token, // token 
    process.env.JWT_ACCESS_TOKEN_SECRET,
    (error, decoded) => {
      if(error) return res.sendStatus(403); // token is received but invalid (it may have been tampered with), send forbidden status
      req.username = decoded.UserInfo.username;
      req.roles = decoded.UserInfo.roles;
      next();
    }
  )
}

module.exports = verifyJWT;