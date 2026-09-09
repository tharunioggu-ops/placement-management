# Smart College Placement Platform - Setup Guide

## Quick Start (5 minutes)

### Prerequisites Check
- Node.js 14+ installed
- MongoDB running locally or Atlas connection string ready
- Groq API key from https://console.groq.com

### Step 1: Clone/Extract the Project

The project is located at: `c:/Users/otula/OneDrive/Desktop/placement management/smart-college-placement/`

### Step 2: Setup Backend

Open PowerShell/Terminal in the `smart-college-placement/server` directory:

```powershell
# Install dependencies
npm install

# Create .env file from example
Copy-Item .env.example .env

# Edit .env with your configuration
# Add your actual values:
# - MONGO_URI: your MongoDB connection string
# - JWT_SECRET: a random secret key
# - GROQ_API_KEY: your Groq API key
# - CLIENT_URL: http://localhost:5173
```

**Edit .env file:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-placement
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
GROQ_API_KEY=your_groq_api_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Step 3: Start Backend

```powershell
# Run development server
npm run dev
```

Backend will run on: `http://localhost:5000`

### Step 4: Setup Frontend

Open a NEW PowerShell/Terminal in the `smart-college-placement/client` directory:

```powershell
# Install dependencies
npm install

# Create .env file from example
Copy-Item .env.example .env
```

**Edit .env file:**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 5: Start Frontend

```powershell
# Run development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 🎯 Testing the Application

### 1. User Registration

Visit: `http://localhost:5173/register`

**Register as Student:**
- Name: John Doe
- Email: student@example.com
- Password: password123
- Role: Student
- Phone: 9876543210

**Register as Recruiter:**
- Name: Jane Smith
- Email: recruiter@example.com
- Password: password123
- Role: Recruiter
- Phone: 9876543211

### 2. Login

Visit: `http://localhost:5173/login`

Use the credentials you just registered.

### 3. Student Features to Test

- **Dashboard:** View profile completion, applications, and stats
- **Jobs:** Browse available jobs and filter them
- **AI Assistant:** Chat with AI, analyze resume, get interview prep
- **Profile:** Complete your academic details and skills

### 4. Recruiter Features to Test

- **Company Profile:** Complete company information
- **Post Jobs:** Create new job postings
- **Applicants:** Review student applications
- **Analytics:** View recruitment statistics

### 5. Admin Features

Login with admin credentials (you need to manually set this in MongoDB):

```javascript
// Add admin user directly to MongoDB
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: bcrypt_hashed_password,
  role: "admin",
  isActive: true,
  createdAt: new Date()
})
```

Then admin can:
- View all students and recruiters
- Approve/reject jobs
- Verify companies
- View placement analytics

## 📊 API Testing with Postman

### 1. Register Endpoint

**POST** `http://localhost:5000/api/auth/register`

Body (JSON):
```json
{
  "name": "John Doe",
  "email": "student@example.com",
  "password": "password123",
  "role": "student",
  "phone": "9876543210"
}
```

### 2. Login Endpoint

**POST** `http://localhost:5000/api/auth/login`

Body (JSON):
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

Response will contain JWT token - copy this for authenticated requests.

### 3. Get Student Profile

**GET** `http://localhost:5000/api/students/profile`

Headers:
```
Authorization: Bearer {YOUR_TOKEN_HERE}
```

### 4. Update Student Profile

**PUT** `http://localhost:5000/api/students/profile`

Headers:
```
Authorization: Bearer {YOUR_TOKEN_HERE}
Content-Type: application/json
```

Body (JSON):
```json
{
  "department": "CSE",
  "cgpa": 8.5,
  "year": 3,
  "skills": ["JavaScript", "React", "MongoDB"],
  "technicalSkills": ["HTML", "CSS", "Node.js"]
}
```

### 5. Get All Jobs

**GET** `http://localhost:5000/api/jobs`

Query Parameters:
- `status`: Approved
- `jobType`: Full Time
- `location`: Bangalore

### 6. Create Job (Recruiter Only)

**POST** `http://localhost:5000/api/jobs`

Headers:
```
Authorization: Bearer {RECRUITER_TOKEN_HERE}
Content-Type: application/json
```

Body (JSON):
```json
{
  "companyId": "company_id_from_db",
  "title": "Software Developer",
  "description": "Join our team",
  "location": "Bangalore",
  "jobType": "Full Time",
  "workMode": "Hybrid",
  "salary": "6-8 LPA",
  "experience": "0-2",
  "requiredSkills": ["JavaScript", "React", "Node.js"],
  "eligibleDepartments": ["CSE", "ECE"],
  "minimumCGPA": 7.0,
  "maximumBacklogs": 0,
  "applicationDeadline": "2024-12-31"
}
```

### 7. Apply for Job (Student Only)

**POST** `http://localhost:5000/api/applications`

Headers:
```
Authorization: Bearer {STUDENT_TOKEN_HERE}
Content-Type: application/json
```

Body (JSON):
```json
{
  "jobId": "job_id_from_db",
  "resume": "Resume text or URL",
  "coverLetter": "Why I want this job"
}
```

### 8. Get Student Applications

**GET** `http://localhost:5000/api/students/applications`

Headers:
```
Authorization: Bearer {STUDENT_TOKEN_HERE}
```

### 9. AI Chat

**POST** `http://localhost:5000/api/ai/chat`

Headers:
```
Authorization: Bearer {STUDENT_TOKEN_HERE}
Content-Type: application/json
```

Body (JSON):
```json
{
  "message": "How do I prepare for a frontend developer interview?",
  "studentId": "student_user_id"
}
```

### 10. Admin Dashboard Stats

**GET** `http://localhost:5000/api/admin/dashboard`

Headers:
```
Authorization: Bearer {ADMIN_TOKEN_HERE}
```

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB

```powershell
# Install MongoDB locally
# Run MongoDB service
net start MongoDB

# Connect using MongoDB Compass or CLI
mongosh
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Use in MONGO_URI environment variable

## 🚨 Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Verify MongoDB is running
- Check .env file has correct values

### Frontend won't start
- Check if port 5173 is in use
- Clear node_modules and reinstall: `rm -r node_modules; npm install`
- Check .env has correct API base URL

### API calls failing
- Check backend is running on port 5000
- Verify token is being sent in Authorization header
- Check database connection

### Authentication issues
- Clear localStorage: Open DevTools Console and run `localStorage.clear()`
- Login again with correct credentials

### AI endpoints not working
- Verify GROQ_API_KEY is correctly set
- Check Groq API key is valid
- Ensure backend is sending requests to correct Groq API endpoint

## 📦 Build for Production

### Frontend Build

```powershell
cd client
npm run build
```

This creates an optimized build in `dist/` folder ready for deployment.

### Backend Production

```powershell
cd server
NODE_ENV=production npm start
```

## 🚀 Deployment

### Deploy Frontend to Vercel

1. Push code to GitHub
2. Import repository on Vercel
3. Set `VITE_API_BASE_URL` environment variable to your backend URL
4. Deploy

### Deploy Backend to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Set environment variables:
   - MONGO_URI
   - JWT_SECRET
   - GROQ_API_KEY
   - CLIENT_URL (your Vercel URL)
   - NODE_ENV=production
4. Deploy

## 📝 Sample Data for Testing

### Test Student Account
```
Email: student@test.com
Password: Test@123
CGPA: 8.5
Department: CSE
```

### Test Recruiter Account
```
Email: recruiter@test.com
Password: Test@123
Company: Tech Corp
```

## 📞 Support

If you encounter issues:

1. Check the error logs in terminal
2. Verify all environment variables are set
3. Ensure databases are running
4. Check network connectivity
5. Restart both frontend and backend

---

**Happy Coding! 🎉**
