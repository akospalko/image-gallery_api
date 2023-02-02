const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');

// storage engine for multer-gridfs-storage
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  options: {useNewUrlParser: true, useUnifiedTopology: true},
  file: (req, file) => {
    const {title, author, coordinate, description} = req.body;
    console.log('omg', title, author, coordinate, description);
    const match = ["image/png", "image/jpg"];
    if(match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-any-name-${file.originalname}`;
      return filename;
    }
    return {
      bucketName: "ImageEntry",
      filename: `${Date.now()}-any-name-${file.originalname}`,
    };
  }
})

module.exports = multer({storage})