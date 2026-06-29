const mongoose = require('mongoose');

/**
 * Establishes the MongoDB connection using Mongoose.
 *
 * Architecture note: connection logic lives in its own module (rather than
 * inline in server.js) so it can be reused by the seed script and by any
 * future test setup without duplicating options or error handling.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in the environment');
    }

    const conn = await mongoose.connect(uri);
    console.log(`[db] MongoDB connected -> ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('[db] MongoDB disconnected');
    });
  } catch (err) {
    console.error(`[db] Connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
