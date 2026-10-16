import User from "./models/User.js";
import bcrypt from "bcrypt";
import connectToDatabase from "./db/db.js";

const userRegister = async () => {
    try {
        await connectToDatabase();

        const hashPassword = await bcrypt.hash("admin", 10);

        const newUser = new User({
            name: "Admin",
            email: "admin@gmail.com",
            password: hashPassword,
            role: "admin"
        });

        await newUser.save();

        console.log("Admin user created successfully");

    } catch (error) {
        console.error("Seed Error:", error);
    }
};

userRegister();