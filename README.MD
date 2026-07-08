# HireBridge – Campus Placement Portal

HireBridge is a full-stack, role-based campus placement portal designed to streamline the campus recruitment process. It connects students, recruiters, and administrators through a structured recruitment workflow.

## Live Workflow

Recruiter posts a job → Admin reviews and approves the job → Eligible student applies → Recruiter reviews applicants and updates recruitment rounds → Student tracks application status and receives notifications.

## Features

### Student Portal

* Create and update a student profile
* Upload and view a resume in PDF format
* Browse approved job opportunities
* Search and filter jobs by title, company, location, and job type
* Eligibility validation based on CGPA, branch, skills, and application deadline
* Apply for jobs with an optional cover letter
* Prevent duplicate job applications
* Track placement stages:

  * Applied
  * Shortlisted
  * Online Assessment
  * Technical Interview
  * HR Interview
  * Final Result
* View recruiter messages, round dates, and notifications

### Recruiter Portal

* Post new job openings
* Edit, close, reopen, and delete job postings
* View applicants for posted jobs
* Review student profiles, cover letters, and uploaded PDF resumes
* Schedule recruitment rounds with date, time, and recruiter message
* Update applicant status throughout the recruitment process
* View dashboard statistics and recent applications

### Admin Portal

* View platform statistics for students, recruiters, jobs, and applications
* Approve or reject recruiter job postings
* Activate or deactivate student and recruiter accounts
* Monitor pending and approved job postings

## Tech Stack

### Frontend

* React.js
* React Router DOM
* Axios
* Vite
* Custom Responsive CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs
* Multer for PDF resume uploads

## Project Structure

```text
HireBridge/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/anshul13-hub/HireBridge.git
cd HireBridge
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Create Environment Variables

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 4. Start the Backend Server

```bash
npm run dev
```

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd client
npm install
```

### 6. Start the Frontend Application

```bash
npm run dev
```

The frontend will run on the Vite development URL, usually:

```text
http://localhost:5173
```

The backend will run on:

```text
http://localhost:5000
```

## User Roles

| Role      | Main Responsibilities                                                                  |
| --------- | -------------------------------------------------------------------------------------- |
| Student   | Creates profile, uploads resume, searches jobs, applies, and tracks recruitment status |
| Recruiter | Posts jobs, reviews applicants, schedules rounds, and updates application status       |
| Admin     | Approves jobs, manages user accounts, and monitors platform activity                   |

## Security and Validation

* JWT-based authentication
* Password hashing using bcryptjs
* Protected routes based on user roles
* Duplicate application prevention
* Resume upload validation for PDF files
* Job eligibility validation based on student details
* Admin approval before a job becomes visible to students

## Future Enhancements

* Email notifications for application updates
* Interview calendar integration
* Recruiter-company verification
* Placement analytics and reports
* Export applicant details as CSV or PDF
* Real-time notifications using Socket.IO

## Author

Anshul
B.Tech CSE Student
Full-Stack MERN Developer
