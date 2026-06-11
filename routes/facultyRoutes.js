import express from 'express';
import authenticate from '../middlewares/Authentication.js';
import { authorizeRoles } from '../middlewares/Authorization.js';
import validateRequest from '../middlewares/Validation.js';
import { getFacultyForHod, updateFacultyStatus, getFacultyById } from '../controllers/facultyController.js';

const router = express.Router();

// GET /api/faculty/getFaculty
// Returns faculty for the logged-in HOD (collegeId+departmentId)
router.get('/getFaculty', authenticate, authorizeRoles('hod', 'admin'), validateRequest, getFacultyForHod);

// GET /api/faculty/getFaculty/:id
// Returns faculty by ID
router.get('/getFaculty/:id', authenticate, authorizeRoles('hod', 'admin','student'), validateRequest, getFacultyById);

// PUT /api/faculty/updatefaculty-status/:id
// Update faculty status (activate/deactivate)
router.patch('/updatefaculty-status/:id', authenticate, authorizeRoles('hod', 'admin'), validateRequest, updateFacultyStatus);

export default router;

