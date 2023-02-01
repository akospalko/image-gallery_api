const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  options: {useNewUrlParser: true, useUnifiedTopology: true},
  file: (req, file) => {
    console.log(file);
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

module.exprots = multer({ storage })