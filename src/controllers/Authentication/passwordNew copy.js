const asyncWrapper = require('../../middleware/asyncWrapper');
const User = require('../../models/UserSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const checkLinkValidity = asyncWrapper(async (req, res) => {
  const {id, token} = req.params;
  // console.log(id, token);
  // TODO: find user by provided id 
  const user = await User.findById(id); // find user in DB by provided id
  if(!user) return res.status(404).json({ successs: false, message: 'Invalid user' });
  // verify token
  // convert token back: replace '-' with '.'
  const convertedToken = token.replaceAll('-','.'); 
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET + user.password;
  console.log(convertedToken);

  try {
    const payload = jwt.verify(convertedToken, secret); // verify token
    console.log(payload);
    return res.status(200).json({ successs: true, isTokenValid: true, message: 'Link is valid' });
  } catch(error) {
    console.log(error);
    return res.status(401).json({ successs: false, isTokenValid: false, message: 'Link has expired' });
  }
})

const createNewPassword = asyncWrapper(async (req, res) => {
  const {id, token} = req.params;
  const {email, password, passwordConfirm} = req.body;
  console.log(email, password, passwordConfirm)
  // TODO: validate pw: 2 pw-s are equal, pw is the same -> didn't change (user provided the same pw as the currently acive pw)
  if(!email || !password || !passwordConfirm) return res.status(400).json({ successs: false, message: 'Provide password' });
  if(password !== passwordConfirm) return res.status(400).json({ successs: false, message: 'Passwords do not match' });
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
    // console.log(payload);
    const {id:tokenID, email:tokenEmail} = payload ?? {};
    const user = await User.findOne({_id: tokenID, email: tokenEmail }); // find user by id and email
    if(!user) return res.status(404).json({ successs: false, message: 'Invalid user' });
      console.log('USER:', user);
    // TODO: update DB pw
      // TODO: compre emails (token email to body)
      if(!email != tokenEmail) return res.status(400).json({ successs: false, message: 'Wrong email' });
      // TODO: Handle pw-s: 
        //+ compare body pw with user.password : 
          // - decrypt user.password
          const matchedPassword = await bcrypt.compare(password, user.password);
          // - compare body with user.password: 1. === -> return new password cannot be the same as the currently active password; 2. != ...
          if(matchedPassword) return res.status(400).json({ successs: false, message: 'New password cannot be the same as the current one' });
          try {
            // hash new password
            const hashedPassword = await bcrypt.hash(password, 10); // hash pw
            console.log('new pw', hashedPassword, password);
            // update & save user
            user.password = hashedPassword;
            await user.save();
            return res.status(200).json({successs: true, newPw: {password: hashedPassword}, message: 'New password is saved' })
          } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
          }
          

          // try {
          //   const hashedPassword = await bcrypt.hash(password, 10);    // hash pw using bcrypt
          //   const userCredentials = { email, username, roles: { user: 2001 }, password: hashedPassword }; // create user credentials 
          //   await User.create(userCredentials);    // post new user 
          //   res.status(201).json({ success: true, message: `Created new user: ${username}` }); 
          // } catch(error) {
          //   return res.status(500).json({ success: false, message: error.message })
          // }




          // + update db
         // + send response 
    
  

      // TODO: send success response 
      return res.status(200).json({ successs: true, isTokenValid: true, message: 'Link is valid' });
  } catch(error) {
    console.log(error);
    // TODO: send response - invalid token
    return res.status(401).json({ successs: false, isTokenValid: false, message: 'Link has expired' });
  }
  // res.json({success: true, message: 'create pw test'});
})

module.exports = { createNewPassword, checkLinkValidity }; 