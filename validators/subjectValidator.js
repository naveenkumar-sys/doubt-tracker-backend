import { body } from "express-validator";

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
];      

export { createSubjectValidator };
