
import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";

const addLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        // Validate required fields
        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({
                success: false,
                error: "All leave fields are required",
            });
        }

        // Find the employee associated with the logged-in user
        const employee = await Employee.findOne({
            userId: req.user._id,
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee record not found for this user",
            });
        }

        // Validate leave dates
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                error: "End date cannot be before start date",
            });
        }

        const newLeave = new Leave({
            employeeId: employee._id,
            leaveType,
            startDate,
            endDate,
            reason,
        });

        await newLeave.save();

        return res.status(201).json({
            success: true,
            message: "Leave request submitted successfully",
            leave: newLeave,
        });
    } catch (error) {
        console.error("ADD LEAVE ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Leave add server error",
        });
    }
};

const getLeave = async (req, res) => {
    try {
        // Get the currently logged-in user from the verified token
        const userId = req.user._id;

        // Find the employee record linked to that user
        const employee = await Employee.findOne({ userId });

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee record not found for logged-in user",
            });
        }

        // Fetch only this employee's leave requests
        const leaves = await Leave.find({
            employeeId: employee._id,
        }).sort({ appliedAt: -1 });

        return res.status(200).json({
            success: true,
            leaves,
        });
    } catch (error) {
        console.error("FETCH LEAVES ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch leaves",
        });
    }
};



const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate({
                path: 'employeeId',
                populate: [
                    {
                        path: 'department',
                        select: 'dep_name'
                    },
                    {
                        path: 'userId',
                        select: 'name'
                    }
                ]
            })
            .sort({ appliedAt: -1 });

        return res.status(200).json({
            success: true,
            leaves
        });
    } catch (error) {
        console.error('FETCH ALL LEAVES ERROR:', error);

        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch all leaves'
        });
    }
};


const getLeaveDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const leave = await Leave.findById(id).populate({
            path: "employeeId",
            populate: [
                {
                    path: "userId",
                    model: "User",
                    select: "name email profileImage",
                },
                {
                    path: "department",
                    model: "Department",
                    select: "dep_name",
                },
            ],
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                error: "Leave request not found",
            });
        }

        // Debug the populated data in your backend terminal
        console.log(
            "Employee:",
            leave.employeeId
        );
        console.log(
            "User:",
            leave.employeeId?.userId
        );

        return res.status(200).json({
            success: true,
            leave,
        });
    } catch (error) {
        console.error("FETCH LEAVE DETAIL ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch leave details",
        });
    }
};

const updateLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Only allow valid status values
        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                error: "Status must be Approved or Rejected",
            });
        }

        const leave = await Leave.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true, runValidators: true }
        );

        if (!leave) {
            return res.status(404).json({
                success: false,
                error: "Leave request not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Leave ${status.toLowerCase()} successfully`,
            leave,
        });
    } catch (error) {
        console.error("UPDATE LEAVE STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to update leave status",
        });
    }
};


const getEmployeeLeaves = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found",
            });
        }

        const leaves = await Leave.find({
            employeeId: employee._id,
        }).sort({ appliedAt: -1 });

        return res.status(200).json({
            success: true,
            leaves,
        });
    } catch (error) {
        console.error("FETCH EMPLOYEE LEAVES ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch employee leave history",
        });
    }
};

export { addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave, getEmployeeLeaves };