import express from 'express';
import authenticate from '../middlewares/Authentication.js';
import { authorizeRoles } from '../middlewares/Authorization.js';
import validateRequest from '../middlewares/Validation.js';
import { createDoubtValidator, doubtIdParamValidator, getDoubtsValidator, updateDoubtStatusValidator, resubmitDoubtValidator } from '../validators/doubtValidator.js';
import { createDoubt, getDoubts, getDoubtById, updateDoubtStatus, resubmitDoubt } from '../controllers/doubtController.js';

const router = express.Router();

// Only students can create doubts
router.post('/create', authenticate, authorizeRoles('student'), createDoubtValidator, validateRequest, createDoubt);

// Any authenticated user in the college/department can view doubts
router.get('/getDoubts', authenticate, getDoubtsValidator, validateRequest, getDoubts);
router.get('/getDoubtById/:id', authenticate, doubtIdParamValidator, validateRequest, getDoubtById);

// Students, faculty, hod, or admin can update status 
// (Controller handles specific checks like student only updating their own)
router.patch('/updateDoubtStatus/:id', authenticate, authorizeRoles('student', 'faculty', 'hod', 'admin'), updateDoubtStatusValidator, validateRequest, updateDoubtStatus);

// Only students can resubmit a doubt for re-answer
router.patch('/resubmit/:id', authenticate, authorizeRoles('student'), resubmitDoubtValidator, validateRequest, resubmitDoubt);

export default router;
