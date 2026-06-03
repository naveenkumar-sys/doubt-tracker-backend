Doubt Tracker - Full Backend Architecture & Workflow Guide
1. Project Overview
The Doubt Tracker is a comprehensive, multi-tenant academic platform designed to streamline the process of students asking questions (doubts) and faculty members providing solutions. The platform is built with strict hierarchy and data isolation, ensuring that users only interact with data relevant to their specific College and Department.

Tech Stack
Runtime: Node.js
Framework: Express.js
Database: MongoDB (via Mongoose)
Authentication: JSON Web Tokens (JWT) via HTTP-Only Cookies / Bearer Tokens
Validation: Express-Validator
2. Role-Based Access Control (RBAC)
The entire system operates on a strict four-tier hierarchy:

System Admin (admin): The superuser. Responsible for onboarding new colleges, departments, and their respective Head of Departments (HODs).
Head of Department (hod): The department manager. Responsible for adding Subjects, Faculty members, and Students strictly within their assigned department.
Faculty (faculty): The subject matter experts. They view student doubts, claim them, and provide answers.
Student (student): The end-users. They raise doubts for specific subjects and have the authority to "Accept" a faculty member's answer once their doubt is resolved.
3. Core Database Models & Relationships
College: The top-level container.
Department: Belongs to a College.
User: Belongs to a College and Department. Has a specific role.
Subject: Belongs to a College and Department. Created by the HOD.
Doubt: Created by a student. Linked to a Subject, Department, and College. Contains a status lifecycle.
Answer: Created by a faculty. Linked to a specific Doubt.
4. Step-by-Step Workflows
Flow A: The Infrastructure Setup (Admin Flow)
This flow must happen before anyone else can use the system.

Create College: Admin hits /api/colleges/create to register a new college.
Create Department: Admin hits /api/departments/create to register a department under a specific college.
Onboard HOD: Admin creates a new User with role: "hod", explicitly assigning them the collegeId and departmentId.
Flow B: The Academic Setup (HOD Flow)
The HOD logs in and prepares the platform for their department.

Create Subjects: HOD hits /api/subjects/createSubject. The backend securely auto-assigns the HOD's collegeId and departmentId to the subject.
Onboard Faculty & Students: HOD hits /api/users/create to register users with role: "faculty" or role: "student". The backend ensures these users are locked into the HOD's department.
Flow C: The Doubt Lifecycle (Core Student/Faculty Flow)
The main engine of the application.

Step 1: Asking the Doubt (Student)

Student hits /api/doubts/create.
They provide title, description, subjectId, etc.
Security: The backend ignores any user IDs sent in the body. It securely pulls the studentId, collegeId, and departmentId from the student's JWT token.
Result: Doubt is created with status: "pending".
Step 2: Browsing Doubts (Faculty/Student)

Users hit /api/doubts/getDoubts.
The backend forcibly injects { collegeId, departmentId } into the MongoDB query based on the logged-in user. It is mathematically impossible for a user to see doubts from another college/department.
Supports MongoDB Text Search (?search=), pagination, and status filtering.
Step 3: Claiming a Doubt (Faculty)

Faculty hits /api/doubts/updateDoubtStatus/:id with {"status": "in_progress"}.
The backend automatically records the faculty's ID into the doubt's assignedFacultyId field.
Step 4: Answering the Doubt (Faculty)

Faculty hits /api/answers/createAnswer.
The backend records the answer.
Cross-update: It reaches back into the Doubt document and sets firstAnsweredAt to track response times.
Step 5: Accepting the Answer (Student)

The student reads the answer and hits /api/answers/:answerId/accept.
Security: The backend checks if the logged-in student actually owns the parent doubt.
The answer is marked isAccepted: true.
Cross-update: The parent doubt is automatically changed to status: "resolved" and the resolvedAt timestamp is permanently recorded.
5. Middleware & Security Architecture
Authentication.js (Who are you?)
Extracts the JWT from either the Authorization header OR the accessToken cookie.
Verifies the token using process.env.JWT_ACCESS_SECRET.
Fetches the user from the database and attaches it to req.user. This is the backbone of the entire backend's security, allowing controllers to auto-assign IDs without trusting the frontend.
Authorization.js (What are you allowed to do?)
A flexible, higher-order function: authorizeRoles('admin', 'hod').
Checks if req.user.role exists in the allowed array. If not, it blocks the request with a 403 Forbidden.
Validation.js (Is your data safe?)
Acts as a catcher for express-validator.
Runs before the controller. If the user sent a string instead of an integer, or left a required field blank, this middleware intercepts the request and sends a 400 Bad Request with an array of exactly what fields failed.
6. Future Expansion (Phase 2 Features)
The foundation is perfectly laid out for the following future features based on existing unused models:

Notifications: Alerting users via WebSockets or polling when their doubt is answered.
Activity Logs: Tracking HOD and Admin actions for audit compliance.
Reports: Allowing students to report inappropriate answers or doubts.
