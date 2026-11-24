import mongoose from 'mongoose';

// Use MONGO_URI from the environment if set, otherwise the local database.
// The fallback means anyone who clones the repo can seed with no extra setup.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mission_5';

export async function connectDB() {
  await mongoose.connect(MONGO_URI);
}