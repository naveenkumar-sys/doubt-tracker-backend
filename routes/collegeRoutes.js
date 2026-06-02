import express from "express";
import { createCollege, getColleges, getCollegeById, updateCollegeStatus } from "../controllers/collegeController.js";
import authenticate from "../middlewares/Authentication.js";
import { authorizeAdmin } from "../middlewares/Authorization.js";
import { collegeIdValidator, createCollegeValidator, updateCollegeStatusValidator } from "../validators/collegeValidator.js";

const router = express.Router();

router.post("/createCollege", createCollegeValidator, authenticate, authorizeAdmin, createCollege);
router.get("/getAllColleges", authenticate, authorizeAdmin, getColleges);
router.get("/getCollegeById/:id", collegeIdValidator, authenticate, authorizeAdmin, getCollegeById);
router.put("/updateCollegeStatus/:id", updateCollegeStatusValidator, authenticate, authorizeAdmin, updateCollegeStatus);

export default router;