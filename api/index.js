import app from "../index.js";
import connectToDatabase from "../db/db.js";

let isConnected = false;

export default async function handler(req, res) {
  try {
    if (!isConnected) {
      await connectToDatabase();
      isConnected = true;
    }

    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
}