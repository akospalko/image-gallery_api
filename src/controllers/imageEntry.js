// handle image entry CRUD operations  
const ImageEntry = require('../models/ImageEntrySchema');
const asyncWrapper = require('../middleware/asyncWrapper');
const randomName = require('../helper/randomName');
const resizeImage = require('../middleware/resizeImage');
const { 
  uploadImage,
  deleteImage,
  getStorageSignedURL
} = require('../middleware/storage');

//GET all image entries
const getAllImageEntries = asyncWrapper(async (req, res) => {
  const imageEntries = await ImageEntry.find({}).lean(); // get database entry as a plain object (.lean()) -> converts mongoose doc to plain obj -> allows to add properties to the obj (e.g. imageURL);
  await getStorageSignedURL(imageEntries); // get each fetched image name and create signed url for them (by passing img name to the getObjectParams' key prop).  
  res.status(200).json({ imageEntries }); 
})

//GET single entry
const getSingleImageEntry = asyncWrapper(async (req, res, next) => {
  const { id: entryID } = req.params;
  const imageEntry = await ImageEntry.findOne({ _id: entryID }).lean(); // get db entry as plain object
  if (!imageEntry) {
    return res.status(404).json({message: `No image entry with id : ${entryID}`})
  }
  await getStorageSignedURL(imageEntry); // get signed url, assign  value to imageURL field  
  res.status(200).json({ imageEntry })
})

//CREATE image entry
const createImageEntry = asyncWrapper(async (req, res) => {
  const {title, author, coordinate, description} = req.body;
  const {buffer, mimetype} = req.file;
  const resizedImageBuffer = await resizeImage(buffer);  // resize image before upload using sharp
  const imageName = randomName();  // generate randomized image name 
  await uploadImage(imageName, resizedImageBuffer, mimetype);
  const entryData = {title, author, coordinate, description, imageName} 
  const imageEntry = await ImageEntry.create(entryData); 
  res.status(201).json({ imageEntry }); 
})

//UPDATE (PATCH) image entry
const updateImageEntry = asyncWrapper(async (req, res, next) => {
  const { id: entryID } = req.params; 
  const { title, author, coordinate, description } = req.body; // new req data 
  let updateData = {title, author, coordinate, description}; // new data we want to update the db with 
  if(req.file) {
    const fetchedImageEntry = await ImageEntry.findOne({ _id: entryID });
    const imageName = fetchedImageEntry.imageName;
    updateData = {...updateData, imageName};
    if (!fetchedImageEntry) {
      return res.status(404).json({message: `No image entry with id : ${entryID}`})
    }
    const resizedImageBuffer = await resizeImage(req.file.buffer); // resize image
    await uploadImage(imageName, resizedImageBuffer, req.file.mimetype); // upload image
  }
  const imageEntry = await ImageEntry.findOneAndUpdate({ _id: entryID }, updateData, {   //update entry
    new: true,
    runValidators: true
  });
  if (!imageEntry) {
    return res.status(404).json({message: `No entry with id : ${entryID}`});
  }
  res.status(200).json({ imageEntry });
})

//DELETE image entry
const deleteImageEntry = asyncWrapper(async (req, res, next) => {
  const { id: entryID } = req.params;
  const fetchedImageEntry = await ImageEntry.findOne({ _id: entryID }); // get db single entry
  if (!fetchedImageEntry) {
    return res.status(404).json({message: `No image entry with id : ${entryID}`})
  }
  await deleteImage(fetchedImageEntry.imageName); // delete image from storage
 
  const imageEntry = await ImageEntry.findOneAndDelete({ _id: entryID })
  if (!imageEntry) {
    return res.status(404).json({message: 'Entry does not exist'});
  }
  res.status(200).json({ imageEntry });
})

module.exports = { 
  getAllImageEntries,
  getSingleImageEntry,
  createImageEntry,
  deleteImageEntry,
  updateImageEntry
};