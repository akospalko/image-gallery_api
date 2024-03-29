const express = require('express');
const app = express();
require('dotenv').config(); // access .env contents
const port = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const corsOptions = require('./config/corsOptions');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./database/connect');
const verifyJWT = require('./middleware/verifyJWT');
const credentials = require('./middleware/credentials');
// import routes 
const registerUser = require('./routes/registerUser');
const authenticateUser = require('./routes/authenticateUser');
const refreshToken = require('./routes/refreshToken');
const logoutUser = require('./routes/logoutUser');
const photoGallery = require('./routes/PhotoEntry/photoGallery');
const photoHome = require('./routes/PhotoEntry/photoHome');
const photoUserCollection = require('./routes/PhotoEntry/photoUserCollection');
const photoUserLikes = require('./routes/PhotoEntry/photoUserLikes');
const photoDownloads = require('./routes/PhotoEntry/photoDownloads');
const passwordReset = require('./routes/Authentication/passwordReset');
const passwordNew = require('./routes/Authentication/passwordNew');
const projectMetrics = require('./routes/ProjectMetrics/projectMetrics');

// MIDDLEWARES
// handle url encoded form data
app.use(bodyParser.urlencoded({ extended: true }));
// handle json 
app.use(bodyParser.json());
// handle cookies 
app.use(cookieParser());
// set response header for requests with credentials - must come before CORS 
app.use(credentials) 
// allow CORS for the allowed origin(s) 
app.use(cors(corsOptions));

// ROUTES
// Unprotected
// auth
app.use('/api/v1/register', registerUser);
app.use('/api/v1/login', authenticateUser);
app.use('/api/v1/refresh', refreshToken); // receives cookie w refresht token -> issues a new access token when it expires 
app.use('/api/v1/logout', logoutUser); // logout user by deleting active tokens
app.use('/api/v1/password-forgot', passwordReset) // generate new jwt protected link to reset user's password and send it to the specified email address
app.use('/api/v1/password-reset', passwordNew) // verify opened jwt protected link, and create new password for the user
// photo entry
app.use('/api/v1/photo-home', photoHome); // get photo entries for home page photo slider 
// project metrics/statistics
app.use('/api/v1/project-metrics', projectMetrics); // get project metrics

// Protected
// token verification
app.use(verifyJWT); // protect all routes defined after jwt verification
// photo entry
app.use('/api/v1/photo-gallery', photoGallery); // crud for photo gallery entries and user collection 
app.use('/api/v1/photo-user-collection', photoUserCollection); // add/remove photo to/from user's own collection
app.use('/api/v1/photo-user-like', photoUserLikes); // photo "like" functionalities
app.use('/api/v1/photo-downloads', photoDownloads); // photo downloads tracker
// TODO: route for handling users: create, update, delete, assign role

const serverStart = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log('listening on port', port));
  } catch(error) {
    console.log(error);
  }
}

serverStart();