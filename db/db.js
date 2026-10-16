
import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URL;

    if (!uri) {
      throw new Error("MONGODB_URL is missing from .env");
    }

    await mongoose.connect(uri);
    console.log("Connected to Database");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

export default connectToDatabase;
