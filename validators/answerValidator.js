import { body } from "express-validator";

const createAnswerValidator = [
    // Validate that the doubtId is provided and is a valid MongoDB ID
    body("doubtId")
        .trim()
        .notEmpty()
        .withMessage("Doubt ID is required")
        .isMongoId()
        .withMessage("Invalid doubt ID"),

    // Validate the actual answer text
    body("content")
        .trim()
        .notEmpty()
        .withMessage("Answer content is required")
        .isLength({ min: 5, max: 10000 })
        .withMessage("Answer must be between 5 and 10000 characters"),

    // Optionally validate attachments if they are sent in the body
    body("attachments")
        .optional()
        .isArray()
        .withMessage("Attachments must be an array")
];

export { createAnswerValidator };
