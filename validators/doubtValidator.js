import { body } from "express-validator";

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
    body("semester")
        .notEmpty()
        .withMessage("Semester is required")
        .isInt({ min: 1, max: 12 })
        .withMessage("Semester must be an integer between 1 and 12"),
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

const updateDoubtStatusValidator = [
    body("status")
        .trim()
        .notEmpty()
        .withMessage("Status is required")
        .isIn(["draft", "pending", "in_progress", "resolved", "closed"])
        .withMessage("Invalid status value")
];

export { createDoubtValidator, updateDoubtStatusValidator };
