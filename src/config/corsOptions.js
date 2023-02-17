// configuration for Cross Origin Resource Sharing
const allowedOrigins = require('../config/allowedOrigins');

const corsOptions = {
  origin: (origin, callback) => {
    if(allowedOrigins.indexOf(origin) === -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }

}

module.exports = corsOptions;