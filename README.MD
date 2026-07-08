# HireBridge – Campus Placement Portal

HireBridge is a full-stack, role-based campus placement portal that connects students, recruiters, and administrators through a complete recruitment workflow.

## Live Workflow

Recruiter posts a job → Admin reviews and approves the job → Eligible student applies → Recruiter reviews the applicant and updates recruitment rounds → Student tracks status and receives notifications.

## Features

### Student Portal
- Create and update student profile
- Upload and view resume in PDF format
- Browse approved job opportunities
- Search and filter jobs by title, company, location, and job type
- Eligibility validation based on CGPA, branch, skills, and application deadline
- Apply to jobs with an optional cover letter
- Prevent duplicate job applications
- Track placement stages: Applied, Shortlisted, Online Assessment, Technical Interview, HR Interview, and Final Result
- View recruiter messages, round dates, and notifications

### Recruiter Portal
- Post new job openings
- Edit, close, reopen, and delete job postings
- View applicants for posted jobs
- Review student profiles, cover letters, and uploaded PDF resumes
- Schedule recruitment rounds with date, time, and message
- Update applicant status throughout the recruitment process
- View dashboard statistics and recent applications

### Admin Portal
- View platform statistics for students, recruiters, jobs, and applications
- Approve or reject recruiter job postings
- Activate or deactivate student and recruiter accounts
- Monitor pending and approved job postings

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios
- Custom Responsive CSS
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Multer for PDF resume upload

## Project Structure

```text
HireBridge/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── README.md