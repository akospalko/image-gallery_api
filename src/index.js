const express = require('express');
const app = express();
require('dotenv').config(); // access .env contents
const port = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const imageEntry = require('./routes/imageEntry')
const connectDB = require('./database/connect');

//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//routes
app.use('/api/v1/image-entry', imageEntry);

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