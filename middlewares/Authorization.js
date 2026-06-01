
//here we are using role based authorization, we will create a middleware that checks if the user has the required role to access a route, we will create a function that takes in the allowed roles and returns a middleware that checks if the user's role is in the allowed roles, if not it will return a 403 error, if yes it will call next() to proceed to the next middleware or route handler
// we are using spread operator to allow multiple roles to be passed in when defining the route, for example authorizeRoles("admin", "hod") will allow both admin and hod to access the route, while authorizeRoles("admin") will only allow admin to access the route and we can easily create more combinations as needed using the authorizeRoles function
const authorizeRoles = (...allowedRoles) => {
    // Creates middleware for a route using the roles passed when the route is defined.
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // Stop authenticated users whose role is not allowed on this route.
        //example : [admin, hod ].includes(req.user.role) will check if the user's role is in the allowed roles array, if not it will return a 403 error, if yes it will call next() to proceed to the next middleware or route handler
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action",
            });
        }
        // If the user's role is allowed, proceed to the next middleware or route handler
        next();
    };
};
// Predefined middleware for common role combinations there are two case one is for admin only access and another is for admin and hod access, we can easily create more combinations as needed using the authorizeRoles function
// If we want  only admin will access the oute means we simple use authorizeRoles("admin") and if we want both admin and hod to access the route we can use authorizeRoles("admin", "hod") when defining the route
const authorizeAdmin = authorizeRoles("admin");
const authorizeAdminOrHod = authorizeRoles("admin", "hod");

// Export the predefined middleware functions and the main authorizeRoles function for use in route definitions to protect routes based on user roles.
export { authorizeAdmin, authorizeAdminOrHod, authorizeRoles };
