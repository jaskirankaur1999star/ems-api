import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is missing");
    }

    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(process.env.MONGODB_URL);

    console.log("Connected to Database");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

export default connectToDatabase;