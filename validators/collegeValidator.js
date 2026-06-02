import { body, param } from "express-validator";

//validation for  creating a college
//1. name: required, string, 2-160 characters
//2. code: required, string, 2-30 characters, only letters, numbers, hyphens and underscores allowed
const createCollegeValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("College name is required")
    .isLength({ min: 2, max: 160 })
    .withMessage("College name must contain between 2 and 160 characters"),
  body("code")
    .trim()
    .notEmpty()
    .withMessage("College code is required")
    .isLength({ min: 2, max: 30 })
    .withMessage("College code must contain between 2 and 30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("College code can contain only letters, numbers, hyphens and underscores"),
];
//validation for college ID in URL parameters: must be a valid MongoDB ObjectId
const collegeIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Enter a valid college ID"),
];
//validation for updating college status: college ID must be valid and isActive must be a boolean value (true or false) 
const updateCollegeStatusValidator = [
  ...collegeIdValidator,
  body("isActive")
    .isBoolean()
    .withMessage("isActive must be true or false"),
];

//export validators for use in route definitions, these validators will be used as middleware in the routes that handle college-related operations, ensuring that incoming requests contain valid data before they reach the controller logic.
export {
  collegeIdValidator,
  createCollegeValidator,
  updateCollegeStatusValidator,
};
