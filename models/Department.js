import mongoose from "mongoose";
import Employee from "./Employee.js";
import Salary from "./Salary.js";
import Leave from "./Leave.js";

const departmentSchema = new mongoose.Schema({
    dep_name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
    updateAt: {
        type: Date,
        default: Date.now,
    },
});

departmentSchema.pre(
    "deleteOne",
    { document: true, query: false },
    async function () {
        // Find all employees belonging to this department
        const employees = await Employee.find({
            department: this._id,
        }).select("_id");

        const employeeIds = employees.map((employee) => employee._id);

        if (employeeIds.length > 0) {
            // Delete related leaves and salaries
            await Leave.deleteMany({
                employeeId: { $in: employeeIds },
            });

            await Salary.deleteMany({
                employeeId: { $in: employeeIds },
            });

            // Delete employees in this department
            await Employee.deleteMany({
                _id: { $in: employeeIds },
            });
        }
    }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;