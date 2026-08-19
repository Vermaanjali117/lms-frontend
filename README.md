# LMS Frontend

Angular front end for the AI-powered Learning Management System, letting students browse and enroll in courses, instructors create and manage courses, and admins approve content before it goes live.

## What it does

- Role-based views for students, instructors, and admins
- Student flow: browse courses, enroll with Razorpay payment, track lesson progress, leave reviews, and ask the AI assistant course-related questions
- Instructor flow: create and manage courses awaiting admin approval
- Admin flow: approve or reject submitted courses
- Profile management for all roles
- JWT-based authentication against the backend API

## Tech used

- Angular 19
- Angular Router with role-based routing and guards

## Project structure

- core/ — Shared services, guards, interceptors
- features/admin/ — Course approval, user management
- features/auth/ — Login and signup
- features/instructor/ — Course creation and management
- features/profile/ — User profile
- features/student/ — Course browsing, enrollment, progress, reviews
- shared/components/ — Reusable UI components

## Running it locally

You'll need Node.js and the Angular CLI installed, and the lms-backend API running.

- Clone the repo and run npm install
- Run ng serve
- Open http://localhost:4200/

## Related repo

Backend API: [lms-backend](https://github.com/Vermaanjali117/lms-backend)

## Author

Anjali Verma — [GitHub](https://github.com/Vermaanjali117)
