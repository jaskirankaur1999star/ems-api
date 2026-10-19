import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import Router from "./routes/auth.js";
import connectToDatabase from "./db/db.js";
import departmetRouter from "./routes/department.js";
import employeetRouter from "./routes/employee.js";
import salaryRouter from "./routes/salary.js";
import leaveRouter from "./routes/leave.js";
import dashboardRouter from "./routes/dashboard.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads"))
);

app.use("/api/auth", Router);
app.use("/api/department", departmetRouter);
app.use("/api/employee", employeetRouter);
app.use("/api/salary", salaryRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/dashboard", dashboardRouter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Employee Management Backend is running",
  });
});

export default app;