const mongoose = require('mongoose')

mongoose.set('strictQuery', true)

const dbConnect = async (uri = process.env.MONGODB_URI) => {
  await mongoose.connect(uri)
  console.log('MongoDB connected')
}

module.exports = dbConnect
