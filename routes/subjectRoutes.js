import express from 'express';
import { authorizeAdminOrHod } from '../middlewares/Authorization.js';
import authenticate from '../middlewares/Authentication.js';
import { createSubjectValidator } from '../validators/subjectValidator.js';
import { createSubject, getSubjectsByDepartment } from '../controllers/subjectController.js';
import validateRequest from '../middlewares/Validation.js';

const router = express.Router();


router.post('/createSubject', authenticate, authorizeAdminOrHod, createSubjectValidator, validateRequest, createSubject)
router.get("/getSubject/:departmentId", authenticate, getSubjectsByDepartment);

export default router
