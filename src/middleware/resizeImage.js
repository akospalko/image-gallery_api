// resize image before upload to storage
const sharp = require('sharp'); // used for processing images
const resizeImage = async (buffer, height = 1920, width = 1080, fit = "contain") => {
  const resizedImage = await sharp(buffer).resize({ height: height, width: width, fit: fit }).toBuffer();
  return resizedImage;
}

module.exports = resizeImage;