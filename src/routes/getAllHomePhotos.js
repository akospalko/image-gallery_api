// route for getting all the photos for the home page. nprotected route 
const express = require('express');
const router = express.Router();
const { getAllHomePhotos } = require('../controllers/getAllHomePhotos');

router.route('/').get(getAllHomePhotos);

module.exports = router;