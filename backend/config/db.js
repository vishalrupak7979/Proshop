// import mongoose from 'mongoose'

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI)
//     console.log(`MongoDB Connected: ${conn.connection.host}`.yellow.bold)
//   } catch (error) {
//     console.error(`Error: ${error.message}`.red)
//     process.exit(1)
//   }
// }

// export default connectDB


import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
