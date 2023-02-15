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
const authenticateUser = require('./routes/authenticateUser');
const refreshToken = require('./routes/refreshToken');
const imageEntry = require('./routes/imageEntry');


// MIDDLEWARES
// handle url encoded form data
app.use(bodyParser.urlencoded({ extended: true }));
// handle json 
app.use(bodyParser.json());
// handle cookies 
app.use(cookieParser());
// allow CORS for the whitelisted origin(s) 
app.use(cors(corsOptions));

// ROUTES
app.use('/api/v1/register', registerUser);
app.use('/api/v1/login', authenticateUser);
app.use('/api/v1/refresh', refreshToken); // receives cookie w refresht token -> issues a new access token when it expires 
app.use(verifyJWT);
app.use('/api/v1/image-entry', imageEntry);


const serverStart = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log('listening on port', port));
  } catch(error) {
    console.log(error);
  }
}

serverStart();