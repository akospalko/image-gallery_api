//set up connection to mongoDB using mongoose
const mongoose = require('mongoose');

const connectDB = async (url) => { // url -> connection string provided by mongo  
  await mongoose.set("strictQuery", false);
  await mongoose
  .connect(url, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

module.exports = connectDB;