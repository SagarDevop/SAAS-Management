const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // 1. Primary: Connect to provided MongoDB Atlas URI
  if (uri) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000
      });
      console.log(`✓ MongoDB Connected to Atlas: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB Atlas Connection Error: ${error.message}`);
    }
  }

  // 2. Fallback to Local MongoDB
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/shreedev_saas', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`✓ MongoDB Connected to local instance: ${conn.connection.host}`);
    return;
  } catch (localError) {
    console.log(`ℹ Local MongoDB service not active. Starting automated In-Memory MongoDB...`);
  }

  // 3. Automated In-Memory MongoDB fallback
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({ instance: { dbName: 'shreedev_saas' } });
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✓ In-Memory MongoDB connected: ${memoryUri}`);
  } catch (memError) {
    console.error('Failed to initialize in-memory database:', memError.message);
  }
};

module.exports = connectDB;
