import express from "express";
import { createCollege, getColleges, getCollegeById, updateCollegeStatus } from "../controllers/collegeController.js";
import authenticate from "../middlewares/Authentication.js";
import { authorizeAdmin, authorizeAdminOrHod } from "../middlewares/Authorization.js";
import validateRequest from "../middlewares/Validation.js";
import { collegeIdValidator, createCollegeValidator, updateCollegeStatusValidator } from "../validators/collegeValidator.js";

const router = express.Router();

router.post("/createCollege", authenticate, authorizeAdmin, createCollegeValidator, validateRequest, createCollege);
router.get("/getAllColleges", authenticate, authorizeAdmin, getColleges);
router.get("/getCollegeById/:id", authenticate, authorizeAdminOrHod, collegeIdValidator, validateRequest, getCollegeById);
router.put("/updateCollegeStatus/:id", authenticate, authorizeAdmin, updateCollegeStatusValidator, validateRequest, updateCollegeStatus);

export default router;
