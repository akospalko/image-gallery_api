// logs out user, remove tokens from db and from cookie
const User = require('../models/UserSchema');
const asyncWrapper = require('../middleware/asyncWrapper');

const logoutUser = asyncWrapper(async (req, res) => {
  // handle token removal in client side too
  const cookies = req.cookies;
  if(!cookies?.jwt) return res.sendStatus(204); // jwt token is deleted
  const refreshToken = cookies.jwt;
  // check if user with the refresh token is in the db 
  const foundUser = await User.findOne({ refreshToken });
  if(!foundUser) {
    // if no user found but we have cookie:
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: false }); // remove cookie
    return res.sendStatus(204);
  }
  // delete refresh token from db
  foundUser.refreshToken = "";
  await foundUser.save();
  // remove cookie
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: false }); // remove cookie
  return res.sendStatus(204);
})

module.exports = { logoutUser };