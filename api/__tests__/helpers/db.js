const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongod

const connect = async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()))
}

const clear = async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((c) => c.deleteMany({}))
  )
}

const close = async () => {
  await mongoose.disconnect()
  if (mongod) await mongod.stop()
}

const useTestDb = () => {
  beforeAll(connect)
  afterEach(clear)
  afterAll(close)
}

module.exports = { useTestDb }
