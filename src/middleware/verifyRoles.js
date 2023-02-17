// checks if req rolesArr (accessed from cookie roles) contains allowed role(s)
const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if(!req?.roles) res.sendStatus(401);
    const allowedRolesArray = [...allowedRoles];
    // find result
    const result = req.roles
    .map(role => allowedRolesArray.includes(role)) // check if user's role (req.roles) is among the allowed roles -> create new array 
    .find(value => value === true); // check the newly created array if we have any true values, return first occurence 
    if(!result) return res.sendStatus(401); // if no roles matched -> unauthorized
    next();
  }
}

module.exports = verifyRoles;