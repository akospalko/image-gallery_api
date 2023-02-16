// set access control allow credentials to true if req is coming from the allowed origin
const allowedOrigins = require('../config/allowedOrigins');

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if(allowedOrigins.includes(origin)) { // if req is coming from the proper source
    res.header('Access-Control-Allow-Credentials', true); // expose response to the frontend (when front end request is: credentials: 'include')   
  }
  next();
}

module.exports = credentials