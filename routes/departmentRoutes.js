import express from "express";
import { createDepartment, getDepartments, getDepartmentById, updateDepartmentStatus } from "../controllers/departMentController.js";
import authenticate from "../middlewares/Authentication.js";
import { authorizeAdminOrHod, authorizeAdmin } from "../middlewares/Authorization.js";
import validateRequest from "../middlewares/Validation.js";
import { createDepartmentValidator, departmentIdValidator, updateDepartmentStatusValidator } from "../validators/departmentValidator.js";

const router = express.Router();

router.post("/createDepartment", authenticate, authorizeAdmin, createDepartmentValidator, validateRequest, createDepartment);
router.get("/getAllDepartments", authenticate, authorizeAdmin, getDepartments);
router.get("/getDepartmentById/:id", authenticate, authorizeAdminOrHod, departmentIdValidator, validateRequest, getDepartmentById);
router.put("/updateDepartmentStatus/:id", authenticate, authorizeAdmin, updateDepartmentStatusValidator, validateRequest, updateDepartmentStatus);

export default router;
