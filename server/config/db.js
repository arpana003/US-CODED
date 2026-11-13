import mongoose from 'mongoose';

let memoryServerInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital_twin_pm';
  const forceMemory = process.env.USE_MEMORY_DB === 'true';

  if (forceMemory) {
    return await connectMemoryDB();
  }

  try {
    // Attempt connecting to the configured MongoDB URI with a 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected successfully to MongoDB at ${uri}`);
  } catch (error) {
    console.warn(`[Database] Could not connect to local/remote MongoDB (${error.message}).`);
    console.log('[Database] Initializing fallback in-memory MongoDB server for seamless zero-setup execution...');
    return await connectMemoryDB();
  }
};

const connectMemoryDB = async () => {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memoryUri = memoryServerInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[Database] In-memory MongoDB started and connected successfully at: ${memoryUri}`);
    return memoryUri;
  } catch (err) {
    console.error('[Database] Failed to initialize in-memory MongoDB:', err.message);
    throw err;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};
