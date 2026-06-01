//attemptsByIp is a Map that stores the number of login attempts and the reset time for each IP address, this allows us to track how many times an IP address has attempted to log in within a certain time window and when they can try again after being blocked.
const attemptsByIp = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;


// LoginRateLimiter.js protects your login API from repeated login attempts.
// Without a rate limiter, someone could try thousands of passwords automatically.
// This is called a brute-force attack.
const clearLoginAttempts = (ipAddress) => {
  attemptsByIp.delete(ipAddress);
};

const loginRateLimiter = (req, res, next) => {
  const now = Date.now(); // Get the current timestamp
  const ipAddress = req.ip; // Get the client's IP address from the request object, this is used to identify the source of the login attempts and apply rate limiting based on the IP address, this helps to prevent abuse of the login endpoint by blocking excessive attempts from the same IP address while allowing legitimate users to access the service.
  const currentAttempt = attemptsByIp.get(ipAddress); // Get the current login attempt for the IP address from the attemptsByIp Map, this retrieves the current count of login attempts and the reset time for the given IP address, if there are no attempts recorded for this IP address, it will return undefined, which indicates that this is the first login attempt from this IP address or that previous attempts have been cleared after the reset time.

  // If there are no attempts recorded for this IP address or the reset time has passed, record a new attempt with a count of 1 and a reset time in the future
  if (!currentAttempt || now >= currentAttempt.resetAt) {
    attemptsByIp.set(ipAddress, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    // If this is the first attempt or the reset time has passed, allow the login attempt to proceed by calling next() to move to the next middleware or route handler, this means that the user can attempt to log in without being blocked since they are either making their first attempt or enough time has passed since their last attempt, allowing them to try again after being blocked for too many attempts.
    return next();
  }
  // If the count of attempts for this IP address has reached or exceeded the maximum allowed attempts, calculate the time until the next allowed attempt and return a 429 Too Many Requests response with a message indicating that there have been too many login attempts and when they can try again, this helps to prevent brute-force attacks by blocking excessive login attempts from the same IP address and informing the user when they can try again after being blocked.
  if (currentAttempt.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((currentAttempt.resetAt - now) / 1000);

    res.set("Retry-After", String(retryAfterSeconds));

    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again later.",
    });
  }
// If the count of attempts for this IP address is below the maximum allowed attempts, increment the count of attempts for this IP address and allow the login attempt to proceed by calling next() to move to the next middleware or route handler, this means that the user can continue to attempt to log in as long as they have not exceeded the maximum allowed attempts, and their count of attempts will be tracked until they either succeed in logging in or are blocked after reaching the maximum attempts.
// Attempt 1 -> create record with count 1 -> allowed
// Attempt 2 -> increase count to 2        -> allowed
// Attempt 3 -> increase count to 3        -> allowed
// Attempt 4 -> increase count to 4        -> allowed
// Attempt 5 -> increase count to 5        -> allowed
// Attempt 6 -> count is already 5         -> blocked with 429  
currentAttempt.count += 1;
  next();
};

export { clearLoginAttempts };
export default loginRateLimiter;
