const asyncWrapper = require('../../middleware/asyncWrapper');
const User = require('../../models/UserSchema');
const jwt = require('jsonwebtoken');

const resetUserPassword = asyncWrapper(async (req, res) => {
  const {email} = req.body;
  if(!email) return res.status(400).json({successs: false, message: 'Provide email'}) // verify req body's content
  const user = await User.findOne({ email: email }).exec(); // query for user with the provided email in db
  console.log(user);
  if(!user) return res.status(200).json({successs: true, message: 'Check your mail inbox for password reset link'}) // if no user in db we return a false success status because we don't want to inform client if email is in the db or not  
  //TODO: create one time link
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET + user.password; // create a secret with jwt secret and user's pw
  const payload = {
    id: user._id,
    email: user.email
  }
  const token = jwt.sign(payload, secret, { expiresIn:'15m' }) // create(sign) token
  // create link
  const convertedToken = token.replaceAll('.','-'); // url is not read properly by client if jwt token is used with '.'. solution: replace period with dash, when verifying it should be replaced back.  
  const link = `http://127.0.0.1:5173/password-new/${user._id}/${convertedToken}`; // front-end's route to create new password (/password-create)
  
  
  return res.status(200).json({successs: true, link: link, message: 'Check your mail inbox for password reset link'}) // link sent to email successfully

  //TODO: send mail
  //TODO:
  //TODO:
})

module.exports = {resetUserPassword}