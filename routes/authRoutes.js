import express from "express";
import { getCurrentUser, login, logout, refreshAccessToken } from "../controllers/authController.js";
import authenticate from "../middlewares/Authentication.js";
import loginRateLimiter from "../middlewares/LoginRateLimiter.js";
import validateRequest from "../middlewares/Validation.js";
import { loginValidator } from "../validators/authValidator.js";

const router = express.Router();

router.post("/login", loginRateLimiter, loginValidator, validateRequest, login);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", logout);

export default router;
