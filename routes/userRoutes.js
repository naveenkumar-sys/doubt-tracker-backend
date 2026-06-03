import express from 'express';
import { createUser, updateUserStatus } from '../controllers/userController.js';
import { createUserValidator } from '../validators/userValidator.js';
import authenticate from '../middlewares/Authentication.js';
import { authorizeAdmin, authorizeAdminOrHod } from '../middlewares/Authorization.js';


const router = express.Router();

//This route allows for the creation of new users through a POST request to the /register endpoint.
//The request must first pass through the authenticate middleware to verify that the request is coming from a valid, logged-in user.
//Following successful authentication, the request is processed by the authorizeAdminOrHod middleware, which ensures that the logged-in user has the necessary permissions to create a new user (i.e., they are either an admin or a HOD).
//After authorization, the createUserValidator middleware is applied to validate the incoming request body to ensure that all required fields are present and valid according to the specified schema, this helps to catch any errors early in the request processing pipeline.
//Finally, the createUser controller function is executed to handle the actual creation of the user in the database, this controller interacts with the user model to create a new user document with the provided information, this includes creating the user's credentials, assigning them a role and department, and any other relevant information required for user management.

router.post("/register", authenticate, authorizeAdminOrHod, createUserValidator, createUser);
router.patch("/updateUser-status/:id", authenticate, authorizeAdmin, updateUserStatus);

export default router;