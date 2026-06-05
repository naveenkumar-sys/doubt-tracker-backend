import { body, param } from "express-validator";
// Validation for creating a user
// 1. name: required, string, 2-160 characters
// 2. email: required, valid email format, unique in the database
// 3. password: required, string, minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, one number and one special character
// 4. role: required, string, must be either "admin", "faculty" or "student"
const createUserValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 160 })
        .withMessage("Name must contain between 2 and 160 characters"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Enter a valid email address"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&]/)
        .withMessage("Password must contain at least one special character (@, $, !, %, *, ?, &)"),
    body("role")
        .trim()
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["admin", "hod", "faculty", "student"])
        .withMessage("Role must be either 'admin', 'hod', 'faculty' or 'student'"),
    body("collegeId")
        .optional()
        .isMongoId()
        .withMessage("College ID must be a valid MongoDB ObjectId"),
    body("departmentId")
        .optional()
        .isMongoId()
        .withMessage("Department ID must be a valid MongoDB ObjectId"),
    body("semester")
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage("Semester must be an integer between 1 and 12"),
];

const updateUserStatusValidator = [
    param("id")
        .isMongoId()
        .withMessage("Enter a valid user ID"),
    body("isActive")
        .isBoolean()
        .withMessage("isActive must be true or false"),
];

// Export the createUserValidator for use in route definitions, this validator will be used as middleware in the routes that handle user-related operations, ensuring that incoming requests contain valid data before they reach the controller logic.

export { createUserValidator, updateUserStatusValidator };
