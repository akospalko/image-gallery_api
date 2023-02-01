const express = require('express');
const app = express();
require('dotenv').config(); // access .env contents
const imageEntry = require('./routes/imageEntry')

const port = process.env.PORT || 4000;
const connectDB = require('./database/connect');
const Grid = require('gridfs-stream');
//routes
app.get('/', imageEntry);


//routes for getting, 
// app.get('/image-entries/', (req, res) => {
//   res.send('Testing server. All is OK')
// })
// app.post('/image-entry/', (req, res) => {
//   res.send('Testing server. All is OK')
// })
// app.get('/image-entry/', (req, res) => {
//   res.send('Testing server. All is OK')
// })

const serverStart = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log('listening on port', port));
  } catch(error) {
    console.log(error);
  }
}

serverStart();