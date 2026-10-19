import app from "../index.js";
import connectToDatabase from "../db/db.js";

export default async function handler(req, res) {
  try {
    await connectToDatabase();

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