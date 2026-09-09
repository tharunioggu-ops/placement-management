# API Documentation - Smart College Placement Platform

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### Register User
**Endpoint:** `POST /auth/register`  
**Auth Required:** No  
**Rate Limited:** Yes (5 requests per 15 min)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student|recruiter",
  "phone": "9876543210"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Possible Errors:**
- 400: Missing required fields
- 400: Invalid email format
- 400: Password too short (min 6 chars)
- 409: Email already exists

---

### Login User
**Endpoint:** `POST /auth/login`  
**Auth Required:** No  
**Rate Limited:** Yes (5 requests per 15 min)

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Possible Errors:**
- 400: Missing email or password
- 401: Invalid credentials
- 403: User account is inactive

---

### Logout
**Endpoint:** `POST /auth/logout`  
**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### Get User Profile
**Endpoint:** `GET /users/profile`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "student",
    "profileImage": "",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update User Profile
**Endpoint:** `PUT /users/profile`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9876543211",
  "profileImage": "https://..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

## Student Endpoints

### Get Student Profile
**Endpoint:** `GET /students/profile`  
**Auth Required:** Yes (Student only)

**Response (200):**
```json
{
  "success": true,
  "studentProfile": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": { ... },
    "department": "CSE",
    "cgpa": 8.5,
    "year": 3,
    "skills": ["JavaScript", "React"],
    "technicalSkills": ["Node.js", "MongoDB"],
    "backlogs": 0,
    "placementStatus": "Not Placed"
  }
}
```

---

### Update Student Profile
**Endpoint:** `PUT /students/profile`  
**Auth Required:** Yes (Student only)

**Request Body:**
```json
{
  "department": "CSE",
  "course": "B.Tech",
  "year": 3,
  "cgpa": 8.5,
  "skills": ["Communication", "Problem Solving"],
  "technicalSkills": ["JavaScript", "React", "Node.js"],
  "backlogs": 0,
  "phone": "9876543210",
  "address": "123 Main St",
  "city": "Bangalore"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Student profile updated successfully",
  "studentProfile": { ... }
}
```

**Possible Errors:**
- 400: Invalid CGPA (must be 0-10)
- 404: Student profile not found

---

### Get Student Applications
**Endpoint:** `GET /students/applications`  
**Auth Required:** Yes (Student only)

**Response (200):**
```json
{
  "success": true,
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "studentId": "507f1f77bcf86cd799439012",
      "jobId": { ... },
      "companyId": { ... },
      "status": "Shortlisted",
      "appliedAt": "2024-01-15T10:30:00.000Z",
      "interviewDate": "2024-02-01T14:00:00.000Z",
      "interviewMode": "Online",
      "remarks": "Good performance in coding round"
    }
  ]
}
```

---

### Get Recommended Jobs
**Endpoint:** `GET /students/recommended-jobs`  
**Auth Required:** Yes (Student only)

**Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Software Developer",
      "companyId": { ... },
      "minimumCGPA": 7.5,
      "eligibleDepartments": ["CSE", "ECE"]
    }
  ]
}
```

---

## Job Endpoints

### Get All Jobs
**Endpoint:** `GET /jobs`  
**Auth Required:** No  
**Query Parameters:**
- `status`: Approved|Pending|Rejected|Closed
- `jobType`: Full Time|Internship|Part Time
- `location`: string
- `department`: string

**Example:**
```
GET /jobs?status=Approved&jobType=Full Time&location=Bangalore
```

**Response (200):**
```json
{
  "success": true,
  "count": 25,
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Senior Developer",
      "companyId": { ... },
      "location": "Bangalore",
      "jobType": "Full Time",
      "salary": "8-12 LPA",
      "minimumCGPA": 7.5,
      "status": "Approved",
      "createdAt": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

---

### Get Job by ID
**Endpoint:** `GET /jobs/:id`  
**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "job": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Senior Developer",
    "description": "Looking for experienced developers...",
    "companyId": { ... },
    "recruiterI": { ... },
    "location": "Bangalore",
    "jobType": "Full Time",
    "workMode": "Hybrid",
    "salary": "8-12 LPA",
    "experience": "2-5",
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "minimumCGPA": 7.5,
    "maximumBacklogs": 0,
    "applicationDeadline": "2024-02-15T23:59:59.000Z",
    "status": "Approved"
  }
}
```

---

### Create Job
**Endpoint:** `POST /jobs`  
**Auth Required:** Yes (Recruiter only)

**Request Body:**
```json
{
  "companyId": "507f1f77bcf86cd799439015",
  "title": "Software Developer",
  "description": "Join our development team...",
  "location": "Bangalore",
  "jobType": "Full Time",
  "workMode": "Hybrid",
  "salary": "6-8 LPA",
  "experience": "0-2",
  "requiredSkills": ["JavaScript", "React"],
  "eligibleDepartments": ["CSE", "ECE"],
  "minimumCGPA": 7.0,
  "maximumBacklogs": 0,
  "applicationDeadline": "2024-02-15T23:59:59.000Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "job": { ... }
}
```

**Possible Errors:**
- 400: Missing required fields (title, companyId)
- 403: Not authorized (must be recruiter)

---

### Update Job
**Endpoint:** `PUT /jobs/:id`  
**Auth Required:** Yes (Recruiter - job owner only)

**Request Body:** (Same as Create Job)

**Response (200):**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "job": { ... }
}
```

---

### Delete Job
**Endpoint:** `DELETE /jobs/:id`  
**Auth Required:** Yes (Recruiter - job owner only)

**Response (200):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## Application Endpoints

### Create Application
**Endpoint:** `POST /applications`  
**Auth Required:** Yes (Student only)

**Request Body:**
```json
{
  "jobId": "507f1f77bcf86cd799439014",
  "resume": "Resume content or URL",
  "coverLetter": "Optional cover letter text"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "_id": "507f1f77bcf86cd799439016",
    "studentId": "507f1f77bcf86cd799439012",
    "jobId": "507f1f77bcf86cd799439014",
    "companyId": "507f1f77bcf86cd799439015",
    "status": "Applied",
    "appliedAt": "2024-01-20T15:30:00.000Z"
  }
}
```

**Possible Errors:**
- 400: Missing jobId
- 400: Eligibility criteria not met
- 404: Job or student profile not found
- 409: Already applied to this job

---

### Get All Applications
**Endpoint:** `GET /applications`  
**Auth Required:** Yes  
**Query Parameters:**
- `status`: Applied|Under Review|Shortlisted|etc.
- `jobId`: Filter by job

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "applications": [ ... ]
}
```

---

### Get Application by ID
**Endpoint:** `GET /applications/:id`  
**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "application": { ... }
}
```

---

### Update Application Status
**Endpoint:** `PUT /applications/:id/status`  
**Auth Required:** Yes (Recruiter/Admin only)

**Request Body:**
```json
{
  "status": "Shortlisted",
  "interviewDate": "2024-02-01T14:00:00.000Z",
  "interviewMode": "Online",
  "interviewLocation": "Google Meet",
  "remarks": "Qualified for next round"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "application": { ... }
}
```

---

## Company Endpoints

### Create Company
**Endpoint:** `POST /companies`  
**Auth Required:** Yes (Recruiter only)

**Request Body:**
```json
{
  "companyName": "Tech Corp",
  "logo": "https://...",
  "description": "Leading tech company...",
  "website": "https://techcorp.com",
  "industry": "Technology",
  "location": "Bangalore",
  "email": "hr@techcorp.com",
  "phone": "9876543210",
  "companySize": "Large"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Company created successfully",
  "company": {
    "_id": "507f1f77bcf86cd799439015",
    "recruiterId": "507f1f77bcf86cd799439011",
    "companyName": "Tech Corp",
    "isVerified": false
  }
}
```

---

### Get All Companies
**Endpoint:** `GET /companies`  
**Query Parameters:**
- `verified`: true|false

**Response (200):**
```json
{
  "success": true,
  "count": 50,
  "companies": [ ... ]
}
```

---

### Get Company by ID
**Endpoint:** `GET /companies/:id`

**Response (200):**
```json
{
  "success": true,
  "company": { ... }
}
```

---

### Update Company
**Endpoint:** `PUT /companies/:id`  
**Auth Required:** Yes (Recruiter - owner only)

**Request Body:** (Same as Create Company)

---

### Delete Company
**Endpoint:** `DELETE /companies/:id`  
**Auth Required:** Yes (Recruiter - owner only)

---

### Get Recruiter's Company
**Endpoint:** `GET /companies/recruiter/company`  
**Auth Required:** Yes (Recruiter only)

---

## AI Endpoints

### AI Chat
**Endpoint:** `POST /ai/chat`  
**Auth Required:** Yes (Student only)

**Request Body:**
```json
{
  "message": "How do I prepare for a frontend developer interview?",
  "studentId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Here's a comprehensive guide for frontend developer interviews... [AI Response]"
}
```

---

### Resume Analysis
**Endpoint:** `POST /ai/resume-analysis`  
**Auth Required:** Yes (Student only)

**Request Body:**
```json
{
  "resumeText": "John Doe... [full resume text]",
  "studentId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "success": true,
  "analysis": "Resume Strengths: ... Missing Skills: ... [AI Analysis]"
}
```

---

### Interview Preparation
**Endpoint:** `POST /ai/interview-preparation`  
**Auth Required:** Yes (Student only)

**Request Body:**
```json
{
  "jobTitle": "Full Stack Developer",
  "company": "Tech Corp",
  "skills": ["JavaScript", "React", "Node.js"],
  "studentId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "success": true,
  "preparation": "Common Questions: ... Tips: ... [AI Response]"
}
```

---

### Job Recommendation
**Endpoint:** `POST /ai/job-recommendation`  
**Auth Required:** Yes (Student only)

**Request Body:**
```json
{
  "studentId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "success": true,
  "jobs": [ ... ],
  "recommendation": "Based on your profile... [AI Recommendation]"
}
```

---

## Admin Endpoints

### Get Dashboard Stats
**Endpoint:** `GET /admin/dashboard`  
**Auth Required:** Yes (Admin only)

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalStudents": 150,
    "totalRecruiters": 25,
    "totalCompanies": 30,
    "totalJobs": 200,
    "totalApplications": 1500,
    "placedStudents": 45
  }
}
```

---

### Get All Students
**Endpoint:** `GET /admin/students`  
**Auth Required:** Yes (Admin only)

---

### Get All Recruiters
**Endpoint:** `GET /admin/recruiters`  
**Auth Required:** Yes (Admin only)

---

### Verify Company
**Endpoint:** `PUT /admin/companies/:id/verify`  
**Auth Required:** Yes (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Company verified successfully",
  "company": { ...,"isVerified": true }
}
```

---

### Approve Job
**Endpoint:** `PUT /admin/jobs/:id/approve`  
**Auth Required:** Yes (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Job approved successfully",
  "job": { ...,"status": "Approved" }
}
```

---

### Reject Job
**Endpoint:** `PUT /admin/jobs/:id/reject`  
**Auth Required:** Yes (Admin only)

---

### Get Placement Analytics
**Endpoint:** `GET /admin/analytics`  
**Auth Required:** Yes (Admin only)

**Response (200):**
```json
{
  "success": true,
  "analytics": {
    "placedStudents": 45,
    "notPlacedStudents": 105,
    "notEligibleStudents": 0,
    "departmentStats": [
      {
        "_id": "CSE",
        "placed": 20,
        "total": 50
      }
    ]
  }
}
```

---

## Announcement Endpoints

### Get All Announcements
**Endpoint:** `GET /announcements`

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "announcements": [ ... ]
}
```

---

### Create Announcement
**Endpoint:** `POST /announcements`  
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "title": "Placement Drive Alert",
  "description": "Tech Corp hiring drive on 15th Feb...",
  "priority": "High",
  "targetAudience": "Students"
}
```

---

## Placement Drive Endpoints

### Get All Drives
**Endpoint:** `GET /drives`  
**Query Parameters:**
- `status`: Upcoming|Ongoing|Completed

---

### Create Drive
**Endpoint:** `POST /drives`  
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "companyId": "507f1f77bcf86cd799439015",
  "title": "Tech Corp Campus Recruitment",
  "date": "2024-02-15T00:00:00.000Z",
  "time": "09:00 AM",
  "venue": "Auditorium A",
  "eligibleDepartments": ["CSE", "ECE"],
  "minimumCGPA": 7.0
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "No authorization token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Role student is not authorized to access this route"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "You have already applied to this job"
}
```

### 429 - Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Rate Limiting

- **General API:** 100 requests per 15 minutes per IP
- **Authentication:** 5 login attempts per 15 minutes per IP

---

## Headers Required

All requests (except auth endpoints) should include:
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

**Last Updated:** 2024  
**API Version:** 1.0
