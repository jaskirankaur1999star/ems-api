
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    addLeave,
    getLeaves,
    getLeave,
    getLeaveDetail,
    updateLeave,
    getEmployeeLeaves
} from '../controllers/leaveController.js';

const router = express.Router();

// Employee submits a leave request
router.post('/add', authMiddleware, addLeave);

// Admin fetches all employees' leave requests
router.get('/all', authMiddleware, getLeaves);

// Update the leave status
router.put('/:id', authMiddleware, updateLeave);

// Get leave detail of Employee
router.get('/detail/:id', authMiddleware, getLeaveDetail);

// Admin views leave history for a specific employee
router.get('/employee/:id', authMiddleware, getEmployeeLeaves);

// Employee fetches their own leave requests
router.get('/', authMiddleware, getLeave);

export default router;
