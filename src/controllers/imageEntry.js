// handle image entry CRUD operations  
const ImageEntry = require('../models/ImageEntrySchema');
const asyncWrapper = require('../middleware/asyncWrapper');
const randomName = require('../helper/randomName');
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3"); //s3 storage
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner"); //s3 generate signed urls
const sharp = require('sharp'); // used for processing images

//storage access data
const bucketName = process.env.AWS_S3_BUCKET_NAME
const bucketRegion = process.env.AWS_S3_BUCKET_REGION
const accessKey = process.env.AWS_S3_ACCESS_KEY
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY

//create s3 client object
const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion
})

//GET all image entries
const getAllImageEntries = asyncWrapper(async (req, res) => {
  const imageEntries = await ImageEntry.find({})
  //get each fetched image name and create signed url for them ( by passing img name to the getObjectParams' key prop).  
  for(let entry of imageEntries) {
    const getObjectParams = {
      Bucket: bucketName,
      Key:  entry.imageName //img name to be retreived
    }
    const getCommand = new GetObjectCommand(getObjectParams); // get the image from storage   
    const url = await getSignedUrl(s3, getCommand, { expiresIn: 3600 }); // get the image's signed url
    entry.imageName = url; // create an empty imageURL field and store the signed url
  }
  res.status(200).json({ imageEntries }); 
})

//GET single entry
const getImageEntry = asyncWrapper(async (req, res, next) => {
  const { id: entryID } = req.params
  const imageEntry = await ImageEntry.findOne({ _id: entryID })
  if (!imageEntry) {
    return res.status(404).json({message: `No image entry with id : ${entryID}`})
  }
  res.status(200).json({ imageEntry })
})

//CREATE image entry
const createImageEntry = asyncWrapper(async (req, res) => {
  const {title, author, coordinate, description} = req.body;
  const {buffer, mimetype} = req.file;

  //resize image before upload using sharp
  const resizedImageBuffer = await sharp(buffer).resize({height: 1920, width: 1080, fit:"contain"}).toBuffer();
  //generate randomized image name
  const imageName = randomName(); 
  //aws s3 storage
  const params = {   //set up storage upload params
    Bucket: bucketName , // bucket name
    Key: imageName, // file name
    Body: resizedImageBuffer, // file buffer
    ContentType: mimetype,
  }
  //aws s3 upload file command 
  const putCommand = new PutObjectCommand(params);
  await s3.send(putCommand);
  //create entry
  const entryData = {title, author, coordinate, description, imageName} 
  const imageEntry = await ImageEntry.create(entryData);
  res.status(201).json({ imageEntry }); 
})

//DELETE image entry
const deleteImageEntry = asyncWrapper(async (req, res, next) => {
const { id: entryID } = req.params;
//get db single entry 
const fetchedImageEntry = await ImageEntry.findOne({ _id: entryID });
if (!fetchedImageEntry) {
  return res.status(404).json({message: `No image entry with id : ${entryID}`})
}
//delete image from storage
const params = {
  Bucket: bucketName, // bucket name
  Key: fetchedImageEntry.imageName, // fetched entry's image name
}
const deleteCommand = new DeleteObjectCommand(params);
await s3.send(deleteCommand);
//delete db single entry
const imageEntry = await ImageEntry.findOneAndDelete({ _id: entryID })
if (!imageEntry) {
  return res.status(404).json({message: 'Entry does not exist'})
}
res.status(200).json({ imageEntry });
})

module.exports = {
  getAllImageEntries,
  getImageEntry,
  createImageEntry,
  deleteImageEntry
};