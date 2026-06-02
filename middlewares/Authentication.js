import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

// Middleware to authenticate users based on JWT token in Authorization header or cookies , if token is valid, attaches user object to req.user and calls next(), otherwise returns 401 error
const getTokenFromRequest = (req) => {
  const authorizationHeader = req.headers.authorization;
  // first check whether token in header as bearer token
  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.split(" ")[1];
  }
  // then check whether token in cookies if thistrue it return the token from cookies
  return req.cookies?.accessToken;
};

// Middleware to authenticate users based on JWT token in Authorization header or cookies and attach user object to req.user, if token is valid, otherwise return 401 error
const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decodedToken.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is not available",
      });
    }
    // Attach user object to req.user for use in subsequent middleware and route handlers, this allows us to access the authenticated user's information in any route handler that is protected by this middleware, for example we can access req.user.role to check the user's role in an authorization middleware or we can access req.user._id to associate created doubts with the authenticated user
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    next(error);
  }
};

export default authenticate;
