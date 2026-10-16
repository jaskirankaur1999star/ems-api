import jwt from 'jsonwebtoken';
import User from '../models/User.js'
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const login = async(req,res) => {
    try {
        const {email, password} =  req.body; // req.body = [admin@gmail.com, admin]
        const user = await User.findOne({email})
        if(!user){
            res.status(404).json({success:false, error: "User not exist"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
         if(!isMatch){
            res.status(404).json({success:false, error: "Password Failed"})
        }

        const token = jwt.sign({_id:user._id, role:user.role}, process.env.JWT_KEY, {expiresIn: "10d"})
        res.status(200).json({success:true, token, user:{_id:user._id, name:user.name, role:user.role}})

    } catch (error) {
        console.log(error.message)
    }
}

const verify = (req,res)=>{
    return  res.status(200).json({success:true, user: req.user})
}


const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "All fields are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: "New password must be at least 6 characters",
            });
        }

        // Find the currently logged-in user
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: "Current password is incorrect",
            });
        }

        // Hash and save new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error("CHANGE PASSWORD ERROR:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to change password",
        });
    }
};


export const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email is required",
            });
        }

        const user = await User.findOne({ email });

        // Do not reveal whether an account exists
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If the account exists, reset instructions will be sent.",
            });
        }

        // Generate a secure, random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store only the hash of the token
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Token expires in 15 minutes
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetUrl =
            `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Reset Your EMS Password",
                text: `Use this link to reset your password. It expires in 15 minutes: ${resetUrl}`,
                html: `
                    <h2>Password Reset</h2>
                    <p>You requested a password reset for your account.</p>
                    <p>
                        <a href="${resetUrl}">Reset My Password</a>
                    </p>
                    <p>This link expires in 15 minutes.</p>
                    <p>If you did not request this, you can ignore this email.</p>
                `,
            });
        } catch (emailError) {
            // Do not leave a valid token behind if sending failed
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            throw emailError;
        }

        return res.status(200).json({
            success: true,
            message: "If the account exists, reset instructions will be sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            success: false,
            error: "Unable to send reset instructions",
        });
    }
};

// Reset password using the emailed token
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 8 characters long",
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: "Reset link is invalid or has expired",
            });
        }

        // Hash the new password as your login system expects
        user.password = await bcrypt.hash(password, 10);

        // Make the token single-use
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            error: "Unable to reset password",
        });
    }
}
export {login,verify, changePassword}