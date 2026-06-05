import express from 'express';
import { authorizeRoles } from '../middlewares/Authorization.js';
import authenticate from '../middlewares/Authentication.js';
import {
    assignFacultyToSubjectValidator,
    createSubjectValidator,
    departmentIdParamValidator,
    updateSubjectStatusValidator
} from '../validators/subjectValidator.js';
import {
    assignFacultyToSubject,
    createSubject,
    getSubjectsByDepartment,
    updateSubjectStatus
} from '../controllers/subjectController.js';
import validateRequest from '../middlewares/Validation.js';

const router = express.Router();


router.post('/createSubject', authenticate, authorizeRoles('hod'), createSubjectValidator, validateRequest, createSubject)
router.get("/getSubject/:departmentId", authenticate, departmentIdParamValidator, validateRequest, getSubjectsByDepartment);
router.patch("/updateSubject-status/:id", authenticate, authorizeRoles('hod'), updateSubjectStatusValidator, validateRequest, updateSubjectStatus);
router.patch("/assignFaculty/:id", authenticate, authorizeRoles('hod'), assignFacultyToSubjectValidator, validateRequest, assignFacultyToSubject);

export default router
