const express = require('express');
const app = express();
require('dotenv').config(); // access .env contents
const cors = require('cors');
const port = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const imageEntry = require('./routes/imageEntry');
const registerUser = require('./routes/registerUser');
const authenticateUser = require('./routes/authenticateUser');
const connectDB = require('./database/connect');

//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ // allow cors for a specific origin 
  origin: 'http://127.0.0.1:5173'
}))
//routes
app.use('/api/v1/image-entry', imageEntry);
app.use('/api/v1/register', registerUser);
app.use('/api/v1/login', authenticateUser);
//start server
const serverStart = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log('listening on port', port));
  } catch(error) {
    console.log(error);
  }
}

serverStart();