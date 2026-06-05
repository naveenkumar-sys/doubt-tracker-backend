import { body, param } from "express-validator";

const createSubjectValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Subject name is required")
        .isLength({ min: 2, max: 120 })
        .withMessage("Subject name must contain between 2 and 120 characters"),
    body("code")
        .trim()
        .notEmpty()
        .withMessage("Subject code is required")
        .isLength({ min: 2, max: 30 })
        .withMessage("Subject code must contain between 2 and 30 characters")
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage("Subject code can contain only letters, numbers, hyphens and underscores"),
    body("semester")
        .notEmpty()
        .withMessage("Semester is required")
        .isInt({ min: 1, max: 12 })
        .withMessage("Semester must be an integer between 1 and 12"),
];      

const departmentIdParamValidator = [
    param("departmentId")
        .isMongoId()
        .withMessage("Enter a valid department ID"),
];

const updateSubjectStatusValidator = [
    param("id")
        .isMongoId()
        .withMessage("Enter a valid subject ID"),
    body("isActive")
        .isBoolean()
        .withMessage("isActive must be true or false"),
];

const assignFacultyToSubjectValidator = [
    param("id")
        .isMongoId()
        .withMessage("Enter a valid subject ID"),
    body("facultyId")
        .notEmpty()
        .withMessage("Faculty ID is required")
        .isMongoId()
        .withMessage("Faculty ID must be a valid MongoDB ObjectId"),
];

export {
    assignFacultyToSubjectValidator,
    createSubjectValidator,
    departmentIdParamValidator,
    updateSubjectStatusValidator,
};
