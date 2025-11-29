import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log("Connecting to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB Connected Successfully");
    process.exit();
  })
  .catch((err) => {
    console.log("❌ DB Connection Failed");
    console.log(err);
    process.exit(1);
  });
