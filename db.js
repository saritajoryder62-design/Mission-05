import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://127.0.0.1:27017/mission_5';

export async function connectDB() {
  await mongoose.connect(MONGO_URI);
}