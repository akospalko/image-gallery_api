//aws s3 storage related functionalities (upload/update, delete photos, get storage photo url)
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3"); //s3 storage
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner"); //s3 generate signed urls

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

// upload photo (create/update entries)
const uploadPhoto = async (photoName, resizedFileBuffer, mimetype) => {
const bucketName = process.env.AWS_S3_BUCKET_NAME
  //set up storage upload params 
  const params = { 
      Bucket: bucketName, // bucket name
      Key: photoName, // photo name
      Body: resizedFileBuffer, // photo buffer
      ContentType: mimetype,
    }
  // aws s3 upload photo command 
  const putCommand = new PutObjectCommand(params);
  await s3.send(putCommand); // create entry
}
// delete photo from storage
const deletePhoto = async (photoName) => {
  const params = {
      Bucket: bucketName, // bucket name
      Key: photoName, // fetched entry's photo name
    }
  const deleteCommand = new DeleteObjectCommand(params);
  await s3.send(deleteCommand);
}
// get signed url of the storage photo and pass url to the db entry  
const getStorageSignedURL = async (data, expireTime = 3600) => {
  if(!data) { return }
  if (Array.isArray(data)) {  // 2 or more entries 
    for(let entry of data) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: entry.photoName // photo name to be retreived,
      }
      const getCommand = new GetObjectCommand(getObjectParams); // get the photo from storage   
      const url = await getSignedUrl(s3, getCommand, { expiresIn: expireTime }); // get the photo's signed url
      if(url) {
        entry.photoURL = url; // create an empty photoURL field and store the signed url
      }
    }
  } else { // single entry
    const getObjectParams = {
      Bucket: bucketName,
      Key: data.photoName // photo name to be retreived
    }
    const getCommand = new GetObjectCommand(getObjectParams); // get the photo from storage   
    const url = await getSignedUrl(s3, getCommand, { expiresIn: expireTime }); // get the photo's signed url
    if(url) {
      data.photoURL = url; // create an empty photoURL field and store the signed url
    } 
  }
}

module.exports = {
  uploadPhoto,
  deletePhoto,
  getStorageSignedURL
};