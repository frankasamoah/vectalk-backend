const mongoose = require("mongoose");


const connectToDB = async () => {
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(process.env.MONGODB_DB_URI, () => {
      console.log(`Connected to databasse using mongoose`);
    })
  } catch (error) {
    console.log(error.message);
    process.exit()
  }
}

module.exports = connectToDB