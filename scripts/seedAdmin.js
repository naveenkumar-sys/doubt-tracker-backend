import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/UserModel.js";

dotenv.config();

// Function to validate environment variables
const validateEnvironment = () => {
  // Validate MONGODB_URL
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is required");
  }
  // Validate ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD
  if (!process.env.ADMIN_NAME || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }
  // Validate ADMIN_EMAIL format using a simple regex pattern
  if (process.env.ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD must contain at least 12 characters");
  }
};

const seedAdmin = async () => {
  try {
    // Validate environment variables
    validateEnvironment();
    await mongoose.connect(process.env.MONGODB_URL);
    // Check if an admin account already exists with the provided email, if it does, log a message and exit without creating a new admin account, this prevents the creation of duplicate admin accounts and ensures that the seeding script can be safely run multiple times without causing issues.
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("A user with this admin email already exists");
      return;
    }

    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

    await User.create({
      name: process.env.ADMIN_NAME.trim(),
      email,
      password,
      role: "admin",
    });

    console.log("Initial admin account created successfully");
  } catch (error) {
    console.error("Failed to create initial admin:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
