import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./database/dbConfig.js";
import { errorHandler, notFoundHandler } from "./middlewares/ErrorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import collegeRoutes from "./routes/collegeRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware setup
// It parses incoming requests with JSON payloads and is based on body-parser. This allows us to easily access the data sent in the request body as req.body in our route handlers, which is essential for handling POST and PUT requests where data is often sent in the body of the request, for example when a user submits a login form with their email and password, we can access that data in req.body.email and req.body.password in our login route handler.
app.use(express.json());
// app.use(express.static(path.join(__dirname, "public"))); and for serving static files like images, CSS files, and JavaScript files from the "public" directory, we can use the express.static middleware. This allows us to serve static assets directly without needing to define specific routes for each file. For example, if we have an image at public/images/logo.png, it can be accessed via http://localhost:5000/images/logo.png without needing a separate route handler for that file.
app.use(express.urlencoded({ extended: true }));
// It validate cross origin requests and helps to prevent cross-site scripting (XSS) attacks by setting appropriate HTTP headers, it also helps to secure the app by hiding the X-Powered-By header and setting other security-related headers, this is important for protecting the app from common web vulnerabilities and ensuring that it can safely handle requests from different origins.
app.use(cors());
// Helmet is a collection of middleware functions that set various HTTP headers to help protect the app from common web vulnerabilities, it helps to secure the app by hiding the X-Powered-By header and setting other security-related headers, this is important for protecting the app from common web vulnerabilities and ensuring that it can safely handle requests from different origins.
app.use(helmet());
// Morgan is a HTTP request logger middleware for Node.js, it logs details about incoming requests such as the HTTP method, URL, status code, response time, and more. This is useful for debugging and monitoring the app's traffic and performance.
app.use(morgan("dev"));
// CookieParser is a middleware that parses cookies from the request and makes them available in req.cookies
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the Doubt Tracker API!");
});

app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subjects", subjectRoutes);
// Error handling middleware , why bottom  beacuse we want to handle errors first and then send the response
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
