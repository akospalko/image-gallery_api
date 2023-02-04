//read req multipart/form-data from client into memory
const multer = require('multer');

// store req file in memory pass it on
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

module.exports = multer({upload})