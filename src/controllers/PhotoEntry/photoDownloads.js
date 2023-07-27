// route to handle photo entry downloads tracking + download
const asyncWrapper = require('../../middleware/asyncWrapper');
const PhotoEntryGallery = require('../../models/PhotoEntryGallerySchema');
const { getStorageSignedURL } = require('../../middleware/storage');

// Increment photo downloads 
const downloadPhoto = asyncWrapper(async (req, res) => { 
  // confirm request payload
  const { userID, photoEntryID } = req.params ?? {};
  if(!userID || !photoEntryID) return res.status(400).json({ message: 'User id and photo entry id are required' });
 
  // update downloads
  try {
    const incrementedDownloadCounter = await PhotoEntryGallery.findOneAndUpdate(
      { _id: photoEntryID }, 
      { $inc: { downloads: 1 }}, // ( downloads++ )  
      { new: true, runValidators: true }
    );
    if(!incrementedDownloadCounter) return res.status(400).json({ success: false, message: 'Could not download photo!' }); 
    // get signed photo url
    await getStorageSignedURL(incrementedDownloadCounter); // get signed url, assign value to photoURL field  
    // send response with processed data/error
    const returnPhotoEntry = { _id: photoEntryID, photoURL: incrementedDownloadCounter.photoURL, downloads: incrementedDownloadCounter.downloads };
    res.status(200).json({ success: true, photoEntry: returnPhotoEntry, message: 'Photo was successfully downloaded!'});
  } catch(error) {
    return res.status(500).json({ success: false, message: 'An error occurred during photo download' });
  }
})

module.exports = { downloadPhoto }