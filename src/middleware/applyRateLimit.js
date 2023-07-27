const rateLimit = require('express-rate-limit');
const User = require('../models/UserSchema');
const { ObjectId } = require('mongodb');


// const limitDownloads = async (req, res, next) => {
  // const { userID } = req.params ?? {};
  // // constants 
  // const cooldownDuration = 10 * 60 * 1000; // 10mins in ms // only added to blocked users
  // const timeWindow = 1 * 60 * 1000 // 1mins in ms // if allowedDownloadCount attempts happen within timeWindow -> add cooldown;
  // const allowedDownloadCount = 3; // allowed downloads within the cooldown 

  // const currentTime = new Date();
  // const cooldownExpiration = new Date(currentTime.getTime() + cooldownDuration);

  
  // // find user in db 
  // const user = await User.findById(
  //   ObjectId(userID), 
  //   // {
  //   //   downloadCooldown: user.cooldownExpiration,
  //   //   downloadLimitCount: user.newDownloadLimitCount,
  //   // },
  //   // { new: true }
  // );
  
  // if(!user) return res.status(404).json({ success: false, message: 'Invalid user' }).lean();
  
  // // Check if user can download or on cooldown
  // const { downloadCooldown, downloadLimitCount } = user;
  // console.log(downloadCooldown, downloadLimitCount);
  
  // // check if user's download limit has been reached
  // if(downloadLimitCount >= allowedDownloadCount ) {
  //   const cooldownMs =
  //   if(!isNaN(downloadCooldown) && !isNaN(downloadCooldown)  )
  // }


  // next();
  // get user id
  // declare vars: cooldownTime, attempts

  // find user in db
  

  /* check if user downloadLimitCount > allowedDownloadCount
    if(downloadLimitCount > allowedDownloadCount) {
      // e.g. 3 >= 3 - T
      if(now > cooldown) {
        // e.g. 123444ms > 100000ms -> reset cooldown, counter
        // counter = 0
        // cooldown = 0
      } else {
        e.g. 50000ms > 100000ms -> 
        // increment cooldown ??? - not necessaryl
        // block request 
      }
    } else {
      // e.g. 1 > 3 -> F
      check cooldown - ?
      downloadLimitCount++;
      
      next();
    }

  */
  // T: now is > cooldown end -> downloadLimitCount = 1 // restart downloadLimitCount from 1 
  // F: now is < cooldown end -> block request // download is still on cooldown 


// }

// module.exports = limitDownloads;




// Middleware to limit the amount of requests a user can make to a given endpont

// set up rate limiting
const setUpRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Allow 3 requests per minute
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

// middleware fn - to apply rate limiting to a route 
const applyRateLimit = (req, res, next) => {
  setUpRateLimit(req, res, (err) => {
    if (err) {
      // The rate limit was exceeded
      const statusCode = 429; // too many reqs
      res.status(statusCode).json({ success: err.message.success, message: err.message.message });
    } else {
      // rate limit not exceeded, run next mw
      next();
    }
  });
};
module.exports = applyRateLimit;