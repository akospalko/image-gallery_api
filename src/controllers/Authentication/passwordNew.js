const asyncWrapper = require('../../middleware/asyncWrapper');
const User = require('../../models/UserSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const checkLinkValidity = asyncWrapper(async (req, res) => {
  const {id, token} = req.params;
  if(!id || !token ) return res.status(400).json({ success: false, message: 'provide ID and/or TOKEN' });
  const user = await User.findById(id); // find user in DB by provided id
  if(!user) return res.status(404).json({ success: false, message: 'Invalid user' });
  const convertedToken = token.replaceAll(',','.');   // convert url compatible token back: replace '-' with '.' 
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET + user.password; 
  try {
    // const payload = jwt.verify(convertedToken, secret); 
    jwt.verify(convertedToken, secret); 
    return res.status(200).json({ success: true, isTokenValid: true, message: 'Enter new password' }); // link is valid: enter new password
  } catch(error) {
    return res.status(401).json({ success: false, isTokenValid: false, message: 'Link has expired' });
  }
})
// check token validity, process passed form data, update user's password
const createNewPassword = asyncWrapper(async (req, res) => {
  const {id, token} = req.params;
  if(!id || !token ) return res.status(400).json({ success: false, message: 'provide ID and/or TOKEN' });
  const {email, password, passwordConfirm} = req.body ?? {};
  if(!email || !password || !passwordConfirm) return res.status(400).json({ success: false, message: 'Provide password' });
  const user = await User.findById(id); // find user in DB by provided id
  if(!user) return res.status(404).json({ success: false, message: 'Invalid user' });
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET + user.password;
  const convertedToken = token.replaceAll(',','.'); // convert token back: ',' -> '.' 
  try { 
    const payload = jwt.verify(convertedToken, secret); // verify token
    const {id:tokenID, email:tokenEmail} = payload ?? {};
    const user = await User.findOne({_id: tokenID, email: tokenEmail }); // find user by id and email
    if(!user) return res.status(404).json({ success: false, message: 'Invalid user' });
    //update DB pw
    if(email != tokenEmail) return res.status(400).json({ success: false, errorField: 'email', message: 'Wrong email' }); // compare emails (token - form email)
    // Handle password
    if(password !== passwordConfirm) return res.status(400).json({ success: false, errorField: 'password', message: 'Passwords do not match' }); // compare form passwords 
    const matchedPassword = await bcrypt.compare(password, user.password); // compare form and database passwords 
    if(matchedPassword) return res.status(400).json({ success: false, errorField: 'password', message: 'New password cannot be the same as the current one' }); // deny password reset to the same password as the currently active one
    try {
      const hashedPassword = await bcrypt.hash(password, 10); // hash new password
      user.password = hashedPassword;  // update & save user
      await user.save();
      return res.status(200).json({ success: true, message: 'Success. New password is saved' })
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  } catch(error) {
    return res.status(401).json({ success: false, isTokenValid: false, message: 'Link has expired' }); // invalid token
  }
})

module.exports = { createNewPassword, checkLinkValidity }; 