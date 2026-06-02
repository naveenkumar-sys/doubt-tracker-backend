# PROJECT_CONTEXT.md

## Project Overview

Project Name:
Academic Knowledge & Resolution Platform

Project Type:
College Knowledge Management System

Primary Goal:
Build a centralized platform where academic doubts are stored, searched, answered, and reused instead of being repeatedly answered every semester.

The system should gradually become a permanent academic knowledge base for the institution.

This is NOT a chatbot.

This is NOT an AI-first application.

The primary goal is knowledge retention and faculty workload reduction.

AI is only used later for report summarization.

---

# Business Problem

Current Situation:

* Students repeatedly ask the same doubts every semester.
* Faculty repeatedly answer the same questions.
* Knowledge gets lost in:

  * WhatsApp groups
  * Personal chats
  * Emails
  * Classroom discussions

Consequences:

* Faculty time is wasted.
* Students cannot easily find previous answers.
* Departments cannot identify difficult topics.
* Knowledge is not retained across academic years.

Solution:

Create a searchable academic knowledge repository where:

1. Students search first.
2. Existing answers are reused.
3. New doubts are answered only when necessary.
4. Every answer becomes part of the institutional knowledge base.

---

# System Roles

## Admin

Responsibilities:

* Create colleges
* Create departments
* Create HOD accounts
* Optionally create faculty or student accounts for support purposes
* Manage system-wide settings
* View global analytics

Admin exists above all departments.

Admin does not answer doubts.

---

## HOD

Responsibilities:

* Create and manage faculty accounts within their own department
* Create and manage student accounts within their own department
* View department analytics
* Monitor trends
* Receive weekly reports

HOD can only access data belonging to their department.

Example:

HOD of CSE can manage CSE users only.

User creation boundaries:

* Admin can create colleges, departments, HOD accounts, and any user account when support is required.
* HOD can create faculty and student accounts only.
* When an HOD creates a user, the backend assigns collegeId and departmentId from the logged-in HOD account.
* The backend must not trust collegeId or departmentId submitted by an HOD from the frontend.
* HOD cannot create admin accounts, HOD accounts, or users in another department.
* Faculty and students cannot create user accounts.

---

## Faculty

Responsibilities:

* View pending doubts
* Answer doubts
* Mark doubts as resolved
* View previously resolved doubts

Faculty only work within their department and assigned subjects.

---

## Student

Responsibilities:

* Search existing doubts
* View answers
* Create new doubts
* Track submitted doubts

Students should be encouraged to search before posting.

---

# Core Workflow

Student Login
|
V
Search Existing Doubts
|
|
Found?
/          
Yes         No
|            |
View       Create
Answer     Doubt
|            |
|        Faculty
|        Answers
|            |
|        Knowledge
|        Base Grows
\            /
|
V
Department Analytics
|
V
Weekly HOD Report

---

# Product Philosophy

The system should prioritize:

1. Search Before Create
2. Knowledge Reuse
3. Analytics
4. Department Insights

The system should NOT prioritize:

* AI chat
* AI assistants
* AI generated answers

Those may be future enhancements.

---

# Multi-Tenant Vision

Current Target:

Single College

Future Target:

Multiple Colleges

Architecture should allow future support for:

College
-> Department
-> HOD
-> Faculty
-> Students

Every major entity should eventually support college ownership.

---

# Department Structure

Department is a separate entity.

Examples:

* CSE
* ECE
* EEE
* MECH
* CIVIL

Users do not store department names directly.

Users store departmentId.

Reason:

Department names may change.

Relationships remain stable through IDs.

---

# User Model Expectations

Common Fields:

* name
* email
* password
* role
* departmentId
* isActive
* lastLoginAt

Role Values:

* admin
* hod
* faculty
* student

---

# Subject Ownership

Faculty can teach multiple subjects.

Students belong to a department and semester.

Subjects belong to departments.

Examples:

CSE
-> DBMS
-> Java
-> Operating Systems

ECE
-> Digital Electronics
-> Signals and Systems

---

# Doubt Lifecycle

Draft (optional)
|
Pending
|
In Progress
|
Resolved
|
Closed

Definitions:

Pending:
Faculty has not started.

In Progress:
Faculty is working.

Resolved:
Answer provided.

Closed:
Student accepts answer or issue archived.

---

# Search Strategy

Version 1:

MongoDB Text Search

Search Fields:

* title
* description
* subject
* topic

Workflow:

Student submits query
|
Search Database
|
Return Similar Doubts
|
Student decides:
Reuse or Create New

No AI embeddings in Version 1.

---

# Notifications

Examples:

Student creates doubt:
-> Notify faculty

Faculty answers:
-> Notify student

HOD report generated:
-> Notify HOD

Future:
Email + In-App Notifications

---

# Analytics Requirements

Track:

* Total doubts
* Pending doubts
* Resolved doubts
* Average resolution time
* Most discussed subjects
* Most discussed topics
* Faculty response metrics

Analytics are department-specific.

---

# AI Usage

AI is NOT used for:

* Answer generation
* Similarity search
* Daily operations

AI is ONLY used for:

Weekly report summarization.

Example:

Raw Metrics
|
V
LLM Summary
|
V
Email to HOD

---

# Development Priorities

Phase 1:

Authentication
Authorization
Roles
Departments
Subjects

Phase 2:

Doubt Management
Answer Management
Search

Phase 3:

Notifications
Analytics

Phase 4:

Weekly Reports
AI Summaries

---

# Coding Expectations

Backend Stack:

* Node.js
* Express.js
* MongoDB
* Mongoose

Architecture Style:

* Controller Layer
* Service Layer
* Repository/Data Layer
* Validation Layer

Requirements:

* Separation of concerns
* Reusable services
* Scalable folder structure
* Production-grade error handling
* Consistent API responses

Whenever making architectural decisions, prioritize maintainability, scalability, and clean backend design.



//Final Flow 

Admin
  -> College
  -> Department
  -> HOD account

HOD
  -> Faculty accounts
  -> Student accounts
  -> Subjects
  -> Faculty assignments

Student
  -> Login
  -> Search existing doubts
  -> Reuse existing answer
     OR
  -> Create new doubt

Faculty
  -> Login
  -> View relevant pending doubts
  -> Mark in progress
  -> Add answer
  -> Mark resolved

Student
  -> View answer
  -> Accept answer
  -> Doubt becomes closed and reusable


# Middlewares  Logic
  Authentication.js
  -> reads and verifies JWT
  -> loads active user
  -> attaches user to req.user

Authorization.js
  -> checks permitted roles
  -> supports Admin-only and Admin-or-HOD routes

Validation.js
  -> returns frontend request validation errors

LoginRateLimiter.js
  -> limits repeated login attempts

ErrorHandler.js
  -> handles 404 routes
  -> formats application and database errors



  //for creating user 
  Viewed userRoutes.js:1-17

That is a brilliant question! It is one of the most common points of confusion when connecting a database to a frontend.

The short answer is: **Users will never type or even see the Object ID. The Frontend handles it behind the scenes!**

Here is how it works in practice:

### 1. How it works in the Frontend (React, etc.)
When the Admin goes to the "Create HOD" page on your website, they will see a form with a dropdown menu for College and Department. 

*   **Behind the scenes:** When that page loads, your React app calls `GET /api/colleges` and `GET /api/departments` to get the list of all colleges and departments from your database.
*   **What the Admin sees:** A dropdown menu that says "Anna University".
*   **What the Code sees:** The `<option>` tag in HTML looks like this:
    ```html
    <option value="64abc1234567890def">Anna University</option>
    ```
When the Admin clicks "Submit", the frontend automatically grabs that `value` (the Object ID) and sends it in the JSON body to your backend. The Admin never actually knows it exists!

### 2. How HODs create Students/Faculty
Remember our logic in `userController.js`? We completely automated this! 
The HOD doesn't even get a dropdown menu for College or Department. The backend pulls the `collegeId` and `departmentId` straight from the HOD's own logged-in session (`req.user.collegeId`). 

### 3. How YOU do it right now in Postman
Because you don't have a frontend yet, you are acting as both the frontend and backend. 
When you test this in Postman, you have to:
1. Make a `GET` request to your `getAllColleges` endpoint.
2. Look at the JSON response, highlight the `_id` string, and copy it.
3. Paste that string into your `POST /register` request.

So don't worry—your real users will never have to copy and paste weird database IDs!