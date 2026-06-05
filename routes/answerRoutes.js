import express from 'express';
import authenticate from '../middlewares/Authentication.js';
import { authorizeRoles } from '../middlewares/Authorization.js';
import validateRequest from '../middlewares/Validation.js';
import { answerIdParamValidator, createAnswerValidator, doubtIdParamValidator } from '../validators/answerValidator.js';
import { createAnswer, getAnswersByDoubt, acceptAnswer } from '../controllers/answerController.js';

const router = express.Router();


// POST /api/answers/create
// ONLY faculty can create answers. We enforce this using authorizeRoles('faculty').
router.post('/createAnswer', authenticate, authorizeRoles('faculty'), createAnswerValidator, validateRequest, createAnswer);

// GET /api/answers/doubt/:doubtId
// Any authenticated user (student or faculty) can view the answers to a doubt
router.get('/doubt/:doubtId', authenticate, doubtIdParamValidator, validateRequest, getAnswersByDoubt);

// PATCH /api/answers/:answerId/accept
// Allows the student who asked the doubt to mark an answer as accepted
router.patch('/acceptAnswer/:answerId/', authenticate, authorizeRoles('student', 'hod', 'admin'), answerIdParamValidator, validateRequest, acceptAnswer);

export default router;
