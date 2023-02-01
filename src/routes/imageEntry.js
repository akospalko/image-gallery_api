// route for handling imageEntries 
const express = require('express');
const router = express.Router();
const imageEntry = require('../middleware/imageEntry'); 


router.post('/image-entry/', async (req, res) => {
  if(req.file === undefined) {
    return res.send('you must select a file');
  }
  const imgURL = `http://localhost:8080/file/${req.file.filename}`;
  return res.send(imgURL);
});