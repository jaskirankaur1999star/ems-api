import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Router from "./routes/auth.js";
import connectToDatabase from "./db/db.js";
import departmetRouter from "./routes/department.js";
import employeetRouter from "./routes/employee.js";
import salaryRouter from './routes/salary.js';
import leaveRouter from './routes/leave.js';
import dashboardRouter from './routes/dashboard.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

connectToDatabase();

const app = express();

app.use(cors({
  origin:"https://employee-frontend-azure.vercel.app/",
  credentials:true
}));
app.use(express.json());

// Serve uploaded images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads"))
);

// Routes
app.use("/api/auth", Router);
app.use("/api/department", departmetRouter);
app.use("/api/employee", employeetRouter);
app.use("/api/salary", salaryRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/dashboard", dashboardRouter); 

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});