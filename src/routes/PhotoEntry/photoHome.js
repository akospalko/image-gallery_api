// route for getting all the photos for the home page (unprotected route) 
const express = require('express');
const router = express.Router();
const { getAllHomePhotos } = require('../../controllers/PhotoEntry/photoHome');

router.route('/').get(getAllHomePhotos);

module.exports = router;