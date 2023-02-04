//aws s3 storage related functionalities (upload/update, delete images, get storage file url)
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

// upload image file (create/update entries)
const uploadImage = async (imageName, resizedImageBuffer, mimetype) => {
const bucketName = process.env.AWS_S3_BUCKET_NAME
  //set up storage upload params 
  const params = { 
      Bucket: bucketName, // bucket name
      Key: imageName, // file name
      Body: resizedImageBuffer, // file buffer
      ContentType: mimetype,
    }
  // aws s3 upload file command 
  const putCommand = new PutObjectCommand(params);
  await s3.send(putCommand); // create entry
}


//delete image from storage
const deleteImage = async (imageName) => {
  const params = {
      Bucket: bucketName, // bucket name
      Key: imageName, // fetched entry's image name
    }
  const deleteCommand = new DeleteObjectCommand(params);
  await s3.send(deleteCommand);
}

// get signed url of the storage file and pass url to the db entry  
const getStorageSignedURL = async (data, expireTime = 3600) => {
  if(!data) { return }
  if (Array.isArray(data)) {  // 2 or more entries 
    for(let entry of data) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: entry.imageName //img name to be retreived
      }
      const getCommand = new GetObjectCommand(getObjectParams); // get the image from storage   
      const url = await getSignedUrl(s3, getCommand, { expiresIn: expireTime }); // get the image's signed url
      if(url) {
        entry.imageURL = url; // create an empty imageURL field and store the signed url
      }
    }
  } else { // single entry
    const getObjectParams = {
      Bucket: bucketName,
      Key: data.imageName //img name to be retreived
    }
    const getCommand = new GetObjectCommand(getObjectParams); // get the image from storage   
    const url = await getSignedUrl(s3, getCommand, { expiresIn: expireTime }); // get the image's signed url
    if(url) {
      data.imageURL = url; // create an empty imageURL field and store the signed url
    } 
  }
}


module.exports = {
  uploadImage,
  deleteImage,
  getStorageSignedURL
};