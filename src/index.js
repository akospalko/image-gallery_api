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
const registerUser = require('./routes/registerUser');
const credentials = require('./middleware/credentials');
const authenticateUser = require('./routes/authenticateUser');
const refreshToken = require('./routes/refreshToken');
const logoutUser = require('./routes/logoutUser');
const imageEntry = require('./routes/imageEntry');


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
app.use('/api/v1/register', registerUser);
app.use('/api/v1/login', authenticateUser);
app.use('/api/v1/refresh', refreshToken); // receives cookie w refresht token -> issues a new access token when it expires 
app.use('/api/v1/logout', logoutUser); // logout user by deleting active tokens

app.use(verifyJWT); // protect all routes defined after invoked
app.use('/api/v1/image-entry', imageEntry);
//TODO: route for handling users: create, update, delete, assign role

const serverStart = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log('listening on port', port));
  } catch(error) {
    console.log(error);
  }
}

serverStart();