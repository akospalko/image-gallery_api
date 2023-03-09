// resize photo before upload to storage
const sharp = require('sharp'); // used for processing photos
const resizePhoto = async (buffer, height = 1920, width = 1080, fit = "contain") => {
  const resizedPhoto = await sharp(buffer).resize({ height: height, width: width, fit: fit }).toBuffer();
  return resizedPhoto;
}

module.exports = resizePhoto;