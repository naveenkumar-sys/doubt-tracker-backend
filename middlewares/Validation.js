import { validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  // Check for validation errors from previous validation middlewares (defined in route definitions using express-validator). If there are errors, return a 400 Bad Request response with details about the invalid fields. If there are no errors, call next() to proceed to the next middleware or route handler.
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: errors.array().map(({ path, msg }) => ({
        field: path,
        message: msg,
      })),
    });
  }

  next();
};

export default validateRequest;

// Frontend sends data
//   -> Validation rules run
//   -> validateRequest middleware checks results
//   -> Invalid data: return 400 response
//   -> Valid data: call next()
//   -> Controller runs


// {
//   "success": false,
//   "message": "Invalid request data",
//   "errors": [
//     {
//       "field": "email",
//       "message": "Valid email is required"
//     },
//     {
//       "field": "password",
//       "message": "Password is required"
//     }
//   ]
// }