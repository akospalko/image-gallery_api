//set up connection to mongoDB using mongoose
const mongoose = require('mongoose');

const connectDB = async (url) => { // url -> connection string provided by mongo  
  mongoose.set("strictQuery", false);
  const params ={ 
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
  mongoose
  .connect(url, params);
}

module.exports = connectDB;