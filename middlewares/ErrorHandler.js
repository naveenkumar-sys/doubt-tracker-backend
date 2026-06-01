
// Middleware to handle errors and This runs when no route matches the request. It returns a 404 error with a message indicating that the route was not found, including the HTTP method and the original URL of the request. This helps clients understand that they have made a request to an endpoint that does not exist on the server.
// //{
//   "success": false,
//   "message": "Route not found: GET /api/unknown-page"
// }
// //

// The errorHandler middleware is a centralized error handling function that catches errors thrown in the application and sends appropriate HTTP responses based on the type of error. It checks for specific error types such as ValidationError, duplicate key errors (code 11000), and CastError, and returns corresponding status codes and messages. For any other unhandled errors, it returns a 500 Internal Server Error response with the error message.
// we sue conroller and middleware like next(error) to pass the error to this error handling middleware, for example if we have a route handler that throws an error like throw new Error("Something went wrong") or if we have a validation error from mongoose it will be caught by this error handling middleware and it will return the appropriate response based on the type of error, this helps us to centralize our error handling logic and avoid having try-catch blocks in every route handler, we can simply throw errors and let this middleware handle them and send consistent error responses to the client.
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource identifier",
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

export { errorHandler, notFoundHandler };
