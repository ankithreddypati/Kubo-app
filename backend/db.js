// db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'kubodatabase' 
    });
    console.log('MongoDB connected successfully to kubodatabase');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;