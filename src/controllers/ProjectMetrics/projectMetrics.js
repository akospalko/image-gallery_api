// TODO: add download counts
// Calculate and return project metrics
const PhotoEntryGallery = require('../../models/PhotoEntryGallerySchema');
const asyncWrapper = require('../../middleware/asyncWrapper');

// HELPER
// get project metrics: photos, geolocated photos, authors, likes, times collectionized, downloads 
const calculateMetrics = (photoEntries) => {
  // params: photoEntries: [{}] - gallery photo entries 
  // return: {} - aggregated metrics values
  
  const metrics = {
    likes: 0,
    collectionized: 0,
    downloaded: 0,
    photos: 0,
    locations: 0, 
  };
  // handle empty / not available photo entries
  if(!photoEntries?.length) return metrics;
  // container for unique authors
  const uniqueAuthors = []; 

  // aggregate entry values
  for(let i= 0; i < photoEntries?.length; i++) {
    // calc likes, collectionized photos 
    metrics.likes += photoEntries[i].likes?.length || 0;
    metrics.collectionized += photoEntries[i].inCollection?.length || 0;
    metrics.downloaded += photoEntries[i].downloaded?.length || 0;
    // calc photos
    metrics.photos++;
    // calc locations
    if(photoEntries[i].gpsLatitude && photoEntries[i].gpsLongitude) {
      metrics.locations++;
    }
    // calc unique authors
    if(!uniqueAuthors.includes(photoEntries[i].author)) {
      uniqueAuthors.push(photoEntries[i].author);
    }
  }
  // assign calculated unique authors to metrics
  metrics.authors = uniqueAuthors?.length || 0;
  return metrics;
}

// CONTROLLER
const getProjectMetrics = asyncWrapper(async (req, res) => {
  // get photo entries
  const photoEntries = await PhotoEntryGallery.find({}).lean(); 
  if(!photoEntries) return res.status(404).json({ success: false, message: 'Couldn\'t fetch photos' }); // faield / no entries  
  res.status(200).json({ success: true, message: 'Calculating metrics were successful', metrics: calculateMetrics(photoEntries) });
})

module.exports = { getProjectMetrics }