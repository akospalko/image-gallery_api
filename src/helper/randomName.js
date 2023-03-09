// generate random name
// currently it is only used for generating name for imgs before uploading to storage
const crypto = require('crypto'); // generate random file name

const randomName = (bytes = 32) => (
  crypto.randomBytes(bytes).toString('hex')
);

module.exports = randomName;