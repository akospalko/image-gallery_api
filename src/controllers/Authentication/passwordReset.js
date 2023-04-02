const asyncWrapper = require('../../middleware/asyncWrapper');
const User = require('../../models/UserSchema');
const jwt = require('jsonwebtoken');
const allowedOrigins = require('../../config/allowedOrigins');
const mailPasswordResetLink = require('../../middleware/mailPasswordResetLink');
const timestamp = require('../../helper/timestamp'); 

const resetUserPassword = asyncWrapper(async (req, res) => {
  const linkExpiryTime = '15' // minutes
  const {email} = req.body;
  if(!email) return res.status(404).json({ success: false, message: 'Provide email' }) // verify req body's content
  const user = await User.findOne({ email: email }).exec(); // query for user with the provided email in db
  if(!user) return res.status(200).json({ success: true, message: 'An email is sent to you with a password reset link' }) // if no user in db we return a false success status because we don't want to inform client if email is in the db or not  
  // Create one time link
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET + user.password; // create a secret with jwt secret and user's password
  const payload = {
    id: user._id,
    email: user.email
  }
  const token = jwt.sign(payload, secret, { expiresIn: `${linkExpiryTime}m` }) // create(sign) token
  const convertedToken = token.replaceAll('.',','); // url parameter is not read properly by client if jwt token is used with '.', later (before jwt.verify()) should be replaced back to original value
  const link = `${allowedOrigins[0]}/password-forgot/${user._id}/${convertedToken}`; // front-end's route to create new password (/password-create)
  const passwordRequestTimestamp = timestamp();
  const mailData = { email, username: user.username, link, dateTime: passwordRequestTimestamp };
  await mailPasswordResetLink(mailData); // send email
  res.status(200).json({ success: true, message: 'An email is sent to you with a password reset link' }) // success
})

module.exports = {resetUserPassword}