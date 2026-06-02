import { body, param } from 'express-validator';

//validation for  creating a department
//1. name: required, string, 2-160 characters
//2. code: required, string, 2-30 characters, only letters, numbers, hyphens and underscores allowed
const createDepartmentValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Department name is required")
        .isLength({ min: 2, max: 160 })
        .withMessage("Department name must contain between 2 and 160 characters"),
    body("code")
        .trim()
        .notEmpty()
        .withMessage("Department code is required")
        .isLength({ min: 2, max: 30 })
        .withMessage("Department code must contain between 2 and 30 characters")
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage("Department code can contain only letters, numbers, hyphens and underscores"),
    body("collegeId")
        .notEmpty()
        .withMessage("College ID is required")
        .isMongoId()
        .withMessage("College ID must be a valid MongoDB ObjectId"),
];
//validation for department ID in URL parameters: must be a valid MongoDB ObjectId
const departmentIdValidator = [
    param("id")
        .isMongoId()
        .withMessage("Enter a valid department ID"),
];
//validation for updating department status: department ID must be valid and isActive must be a boolean value (true or false) 
const updateDepartmentStatusValidator = [
    ...departmentIdValidator,
    body("isActive")
        .isBoolean()
        .withMessage("isActive must be true or false"),
];

//export validators for use in route definitions, these validators will be used as middleware in the routes that handle department-related operations, ensuring that incoming requests contain valid data before they reach the controller logic.
export {
    createDepartmentValidator,
    departmentIdValidator,
    updateDepartmentStatusValidator,
};