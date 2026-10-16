import path from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import mongoose from "mongoose";

// ===============================
// MULTER STORAGE
// ===============================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
});

// ===============================
// ADD EMPLOYEE
// ===============================
const addEmployee = async (req, res) => {
    try {
        console.log("========== REQUEST BODY ==========");
        console.log(req.body);

        console.log("========== FILE ==========");
        console.log(req.file);

        const {
            name,
            email,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            password,
            role,
        } = req.body;

        // Check required values
        if (
            !name ||
            !email ||
            !employeeId ||
            !department ||
            !salary ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                error: "Required fields are missing",
            });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: "User already exists",
            });
        }

        // Check existing employee ID
        const existingEmployee = await Employee.findOne({ employeeId });

        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                error: "Employee ID already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            profileImage: req.file ? req.file.filename : "",
        });

        const savedUser = await user.save();

        console.log("========== USER SAVED ==========");
        console.log(savedUser);

        // Create Employee
        const employee = new Employee({
            userId: savedUser._id,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary: Number(salary),
        });

        const savedEmployee = await employee.save();

        console.log("========== EMPLOYEE SAVED ==========");
        console.log(savedEmployee);

        return res.status(201).json({
            success: true,
            message: "Employee Added Successfully",
            employee: savedEmployee,
        });

    } catch (error) {
        console.log("========== ERROR ==========");
        console.error(error);
        console.log("===========================");

        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// ===============================
// GET ALL EMPLOYEES
// ===============================
const getEmployees = async (req, res) => {
    try {

        console.log("Fetching employees...");

        const employees = await Employee.find()
            .populate({
                path: "userId",
                select: "-password",
            })
            .populate({
                path: "department",
            });

        console.log("Employees found:");
        console.log(employees);

        return res.status(200).json({
            success: true,
            employees,
        });

    } catch (error) {

        console.log("========== GET EMPLOYEE ERROR ==========");
        console.error(error);
        console.log("========================================");

        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};



// const getEmployee = async (req, res) => {
//     const {id} = req.params;
//     try {

//         console.log("Fetching employees...");
//         let employee;
//         employee = await Employee.findById({_id:id})
//             .populate({
//                 path: "userId",
//                 select: "-password",
//             })
//             .populate({
//                 path: "department",
//             });
//              if(!employee)
//              {
//                 employee = await Employee.findOne({userId:id})
//             .populate({
//                 path: "userId",
//                 select: "-password",
//             })
//             .populate({
//                 path: "department",
//             });
//              }

//         console.log("Employees found:");
//         console.log(employee);

//         return res.status(200).json({
//             success: true,
//             employee,
//         });

//     } catch (error) {

//         console.log("========== GET EMPLOYEE ERROR ==========");
//         console.error(error);
//         console.log("========================================");

//         return res.status(500).json({
//             success: false,
//             error: error.message,
//         });
//     }
// };






const getEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        let employee = null;

        // Try Employee document ID first
        if (id && mongoose.Types.ObjectId.isValid(id)) {
            employee = await Employee.findById(id)
                .populate({
                    path: "userId",
                    select: "-password",
                })
                .populate("department");

            // Try User ID if Employee ID didn't match
            if (!employee) {
                employee = await Employee.findOne({ userId: id })
                    .populate({
                        path: "userId",
                        select: "-password",
                    })
                    .populate("department");
            }
        }

        // If the requested ID didn't match, allow a user to
        // find their own employee record using their verified token.
        if (!employee && req.user) {
            employee = await Employee.findOne({
                userId: req.user._id,
            })
                .populate({
                    path: "userId",
                    select: "-password",
                })
                .populate("department");
        }

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found",
            });
        }

        // Employees may only view their own record.
        // Admins may view other employees.
        if (
            req.user.role !== "admin" &&
            employee.userId._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                error: "You are not authorized to view this employee",
            });
        }

        return res.status(200).json({
            success: true,
            employee,
        });
    } catch (error) {
        console.error("GET EMPLOYEE ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};


const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            role
        } = req.body;

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found"
            });
        }

        // Update Employee
        employee.employeeId = employeeId;
        employee.dob = dob;
        employee.gender = gender;
        employee.maritalStatus = maritalStatus;
        employee.designation = designation;
        employee.department = department;
        employee.salary = salary;

        await employee.save();

        // Update User
        const user = await User.findById(employee.userId);

        if (user) {
            user.name = name;
            user.email = email;
            user.role = role;

            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// const fetchEmployeesByDepId = async(req, res) => {

//     const {id} = req.params;
//     try {

//         console.log("Fetching employees...");

//         const employee = await Employee.find({department:id})
//         console.log("Employees found:");
//         console.log(employee);
//         return res.status(200).json({
//             success: true,
//             employee,
//         });

//     } catch (error) {

//         console.log("========== GET EMPLOYEE By Id ERROR ==========");
//         console.error(error);
//         console.log("========================================");

//         return res.status(500).json({
//             success: false,
//             error: error.message,
//         });
//     }

// };





const fetchEmployeesByDepId = async (req, res) => {
    try {
        const { id } = req.params;

        const employees = await Employee.find({ department: id })
            .populate("userId", "name email")
            .populate("department", "dep_name");

        return res.status(200).json({
            success: true,
            employees
        });
    } catch (error) {
        console.error("Fetch employees by department:", error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found",
            });
        }

        await employee.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
        });
    } catch (error) {
        console.error("DELETE EMPLOYEE ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to delete employee",
        });
    }
};

export {
    addEmployee,
    upload,
    getEmployees,
    getEmployee,
    updateEmployee,
    fetchEmployeesByDepId
};


