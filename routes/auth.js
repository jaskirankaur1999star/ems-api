import express from 'express'
import { login, verify,forgotPassword, resetPassword } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { changePassword } from "../controllers/authController.js";
// import { verify } from 'jsonwebtoken'
const router = express.Router()
router.post('/login',login)
router.get('/verify',authMiddleware, verify)
router.put("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
export default router