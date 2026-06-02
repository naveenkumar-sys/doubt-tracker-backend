import express from "express";
import { createDepartment, getDepartments, getDepartmentById, updateDepartmentStatus } from "../controllers/departMentController.js";
import authenticate from "../middlewares/Authentication.js";
import { authorizeAdmin } from "../middlewares/Authorization.js";
import { createDepartmentValidator, departmentIdValidator, updateDepartmentStatusValidator } from "../validators/departmentValidator.js";

const router = express.Router();

router.post("/createDepartment", createDepartmentValidator, authenticate, authorizeAdmin, createDepartment);
router.get("/getAllDepartments", authenticate, authorizeAdmin, getDepartments);
router.get("/getDepartmentById/:id", departmentIdValidator, authenticate, authorizeAdmin, getDepartmentById);
router.put("/updateDepartmentStatus/:id", updateDepartmentStatusValidator, authenticate, authorizeAdmin, updateDepartmentStatus);

export default router;
