import app from "../index.js";
import connectToDatabase from "../db/db.js";

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectToDatabase();
    isConnected = true;
  }

  return app(req, res);
}