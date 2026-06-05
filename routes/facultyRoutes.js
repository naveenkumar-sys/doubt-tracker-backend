import express from 'express';
import authenticate from '../middlewares/Authentication.js';
import { authorizeRoles } from '../middlewares/Authorization.js';
import validateRequest from '../middlewares/Validation.js';
import { getFacultyForHod, updateFacultyStatus } from '../controllers/facultyController.js';

const router = express.Router();

// GET /api/faculty/getFaculty
// Returns faculty for the logged-in HOD (collegeId+departmentId)
router.get('/getFaculty', authenticate, authorizeRoles('hod', 'admin'), validateRequest, getFacultyForHod);

// PUT /api/faculty/updatefaculty-status/:id
// Update faculty status (activate/deactivate)
router.patch('/updatefaculty-status/:id', authenticate, authorizeRoles('hod', 'admin'), validateRequest, updateFacultyStatus);

export default router;

