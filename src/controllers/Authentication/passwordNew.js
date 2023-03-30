const asyncWrapper = require('../../middleware/asyncWrapper');
const User = require('../../models/UserSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const checkLinkValidity = asyncWrapper(async (req, res) => {
  const {id, token} = req.params;
  console.log(id, token);
  // TODO: find user by provided id 
  const user = await User.findById(id); // find user in DB by provided id
  if(!user) return res.status(404).json({successs: false, message: 'Invalid user'});
  // verify token
  // convert token back: replace '-' with '.'
  const convertedToken = token.replaceAll('-','.'); 
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET + user.password;
  try {
    const payload = jwt.verify(convertedToken, secret); 
    console.log(payload);
  } catch(error) {
    console.log(error);
  }
  // TODO:
  res.json({success: true, message: 'checked link validity'});
})

const createNewPassword = asyncWrapper(async (req, res) => {
  const {id, token} = req.params;
  const {email, password, passwordConfirm} = req.body.data;
  // TODO: validate pw: 2 pw-s are equal, pw is the same -> didn't change (user provided the same pw as the currently acive pw)
  if(!email || !password || !passwordConfirm) return res.status(400).json({ successs: false, message: 'Provide password' });
  if(password !== passwordConfirm) return res.status(400).json({ successs: false, message: 'Passwords does not match' });
  // TODO: find user by provided id  
  const user = await User.findById(id); // find user in DB by provided id
  if(!user) return res.status(404).json({ successs: false, message: 'Invalid user' });
  // TODO: user cannot sav the currently acative password as new pw -> decrypt user.password to make it comparable
  //if(password === user.password) return res.status(400).json({successs: false, message: 'Password is already in use, select a new one.'}); // is new password is the same as the current one 
  
  // TODO: verify token, send back appropriate response(new password is saved/set || link has expired / invalid link)
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET + user.password;
  // convert token back: replace '-' with '.'
  const convertedToken = token.replaceAll('-','.'); 
  try {
    const payload = jwt.verify(convertedToken, secret); 
    console.log(payload);
    // TODO: update DB pw
      // TODO: encrypt new pw 
      const hashedPassword = await bcrypt.hash(password, 10); // hash pw using bcrypt
      // TODO: update pw 
      // const updatedPassword = User.findOneAndUpdate({}); // find by id and email
      // TODO: send success response 
  } catch(error) {
    console.log(error);
    // TODO: send response - invalid token
  }
  // res.json({success: true, message: 'create pw test'});
})

module.exports = { createNewPassword, checkLinkValidity }; 