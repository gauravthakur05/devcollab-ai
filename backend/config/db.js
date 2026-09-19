const mongoose = require('mongoose');

/**
 * Connects to MongoDB using Mongoose.
 * Fails loudly (and exits) if the connection cannot be established,
 * rather than letting the app run in a half-broken state.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[db] MONGODB_URI is not set. Copy .env.example to .env and configure it.');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[db] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[db] MongoDB disconnected');
    });
  } catch (err) {
    console.error('[db] Failed to connect to MongoDB:', err.message);
    console.error('[db] Check that MongoDB is running and MONGODB_URI in .env is correct.');
    process.exit(1);
  }
}

module.exports = connectDB;
