import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { clearLoginAttempts } from "../middlewares/LoginRateLimiter.js";

// Cookie options
const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000,
};
// refresh token cookie options, refresh tokens are typically set to expire after a longer period of time (e.g., 7 days) compared to access tokens (e.g., 15 minutes) because they are used to obtain new access tokens without requiring the user to log in again, this allows for a better user experience while still maintaining security by limiting the lifespan of access tokens and allowing users to stay logged in for longer periods without having to re-authenticate frequently.
const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// JWT token creation function that takes a userId as input and returns a signed JWT token with the userId as the payload, the token is signed using the JWT_ACCESS_SECRET from environment variables and is set to expire in 15 minutes, this function is used to create access tokens that are sent to the client upon successful login and are used for authenticating subsequent requests to protected routes, by including the userId in the token payload, we can identify the authenticated user in future requests when they include the token in the Authorization header or cookies.
const createAccessToken = (userId) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    const error = new Error("JWT access secret is not configured");
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

// JWT refresh token creation function that takes a userId as input and returns a signed JWT token with the userId as the payload, the token is signed using the JWT_REFRESH_SECRET from environment variables and is set to expire in 7 days, this function is used to create refresh tokens that are sent to the client upon successful login and are used to obtain new access tokens without requiring the user to log in again, by including the userId in the token payload, we can identify the authenticated user when they use the refresh token to request a new access token.
const createRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    const error = new Error("JWT refresh secret is not configured");
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};
// Helper function to format user data for response, this function takes a user object as input and returns a formatted user object with selected fields that are safe to include in API responses, this helps to ensure that sensitive information such as the user's password is not included in the response while still providing relevant user information to the client.
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  collegeId: user.collegeId,
  departmentId: user.departmentId,
  semester: user.semester,
  subjectIds: user.subjectIds,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
});
// Login controller function that handles user login requests, it validates the user's email and password, checks if the user account is active, updates the last login time, creates access and refresh tokens, clears login attempts for the user's IP address, sets the tokens in cookies, and returns a success response with the user data and access token, this function is responsible for authenticating users and providing them with the necessary tokens to access protected routes in the application.
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Validate email and password
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    // Check if user account is active
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    // Check if user account is active, if the user account is not active, return a 403 Forbidden response with a message indicating that the user account is inactive, this helps to prevent users with inactive accounts from logging in and accessing protected resources in the application, ensuring that only active users can authenticate and use the service.
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }
    // find the user and update the lastLoginAt field to the user and save the user, this allows us to keep track of when the user last logged in, which can be useful for security monitoring and account management purposes, by updating the lastLoginAt field each time the user successfully logs in, we can have a record of their login activity and potentially identify any suspicious behavior or account access patterns.
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = createAccessToken(user._id.toString());
    const refreshToken = createRefreshToken(user._id.toString());
    // Clear login attempts for the user's IP address upon successful login, this helps to reset the count of login attempts for that IP address, allowing the user to continue logging in without being blocked by the rate limiter after they have successfully authenticated, this is important because it prevents users from being locked out of their accounts due to previous failed login attempts once they have successfully logged in.
    clearLoginAttempts(req.ip);

    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: formatUser(user),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

//Controller function to get the current authenticated user's information, this function assumes that the authenticate middleware has already run and attached the authenticated user object to req.user, it returns a success response with the formatted user data, this allows clients to retrieve the current user's information after they have logged in and have a valid access token, providing them with their profile details and other relevant information.
const getCurrentUser = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: formatUser(req.user),
    },
  });
};

// Controller function to handle user logout, this function clears the access and refresh tokens from the user's cookies and returns a success response, this allows users to securely log out of the application and invalidate their active sessions.
const logout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// Controller function to handle refreshing the access token using a valid refresh token, this function checks for the presence of a refresh token in the cookies, verifies its validity, retrieves the associated user, and if everything is valid, creates a new access token, sets it in the cookies, and returns a success response with the new access token, this allows clients to obtain a new access token without requiring the user to log in again as long as they have a valid refresh token, providing a seamless user experience while maintaining security.
const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decodedToken.userId) .select("-password");

    // Check if user account is active, if the user account is not active, return a 401 Unauthorized response with a message indicating that the user account is not available, this helps to prevent users with inactive accounts from refreshing their access tokens and accessing protected resources in the application, ensuring that only active users can maintain their authenticated sessions and use the service.
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is not available",
      });
    }

    const newAccessToken = createAccessToken(decodedToken.userId);
    // Set the new access token in the cookies with the same options as the original access token, this allows the client to receive the new access token and use it for subsequent authenticated requests, ensuring that the user can continue to access protected resources without having to log in again as long as they have a valid refresh token.
    res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });

  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }
    next(error);
  }
};

export { getCurrentUser, login, logout, refreshAccessToken };
