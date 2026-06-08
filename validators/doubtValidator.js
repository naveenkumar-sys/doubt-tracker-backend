import { body, param, query } from "express-validator";

const createDoubtValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 5, max: 180 })
        .withMessage("Title must contain between 5 and 180 characters"),
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ min: 10, max: 5000 })
        .withMessage("Description must contain between 10 and 5000 characters"),
    body("subjectId")
        .trim()
        .notEmpty()
        .withMessage("Subject ID is required")
        .isMongoId()
        .withMessage("Invalid subject ID"),
    body("topic")
        .optional()
        .trim()
        .isLength({ max: 120 })
        .withMessage("Topic cannot exceed 120 characters"),
    body("tags")
        .optional()
        .isArray()
        .withMessage("Tags must be an array of strings")
];

const doubtIdParamValidator = [
    param("id")
        .isMongoId()
        .withMessage("Enter a valid doubt ID"),
];

const getDoubtsValidator = [
    query("subjectId")
        .optional()
        .isMongoId()
        .withMessage("Subject ID must be a valid MongoDB ObjectId"),
    query("studentId")
        .optional()
        .isMongoId()
        .withMessage("Student ID must be a valid MongoDB ObjectId"),
    query("status")
        .optional()
        .isIn(["draft", "pending", "in_progress", "resolved", "closed"])
        .withMessage("Invalid status value"),
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Limit must be between 1 and 50"),
];

const updateDoubtStatusValidator = [
    ...doubtIdParamValidator,
    body("status")
        .trim()
        .notEmpty()
        .withMessage("Status is required")
        .isIn(["draft", "pending", "in_progress", "resolved", "closed"])
        .withMessage("Invalid status value")
];

export { createDoubtValidator, doubtIdParamValidator, getDoubtsValidator, updateDoubtStatusValidator };
