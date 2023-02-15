// verify access token secret key coming from client side (req.headers.authorization)
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if(!authHeader) return res.status(401).json({message: 'Missing header'})
  console.log(authHeader) // bearer token
  const token = authHeader.split(' ')[1];
  // verify token
  jwt.verify(
    token, // token
    process.env.JWT_ACCESS_TOKEN_SECRET,
    (error, decoded) => {
      if(error) return res.status(403) // token is received but invalid (it may have been tampered with), send forbidden status
      console.log(decoded)
      req.username = decoded.username;
      next();
    }
  )
}

module.exports = verifyJWT;