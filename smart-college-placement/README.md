# Smart College Placement and Recruitment Management Platform - MERN

A comprehensive, production-ready college placement management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and AI-powered features using Groq API.

## 🌟 Features

### Student Features
- User registration and authentication
- Complete profile creation with academic details
- Resume management and upload
- Job search with advanced filtering
- Job application tracking
- Application status monitoring
- AI-powered placement assistant
- Resume analysis and improvement suggestions
- Interview preparation guidance
- Personalized job recommendations
- View announcements and placement drives

### Recruiter Features
- Company registration and profile management
- Job posting and management
- Application tracking and review
- Student shortlisting
- Interview scheduling
- Recruitment analytics
- Batch operations for applications

### Admin/Placement Officer Features
- Dashboard with comprehensive statistics
- Student management
- Recruiter management
- Company verification
- Job approval/rejection
- Application monitoring
- Placement analytics and reports
- Department-wise statistics
- Announcement management

### AI Features
- Groq API integration (llama-3.1-8b-instant)
- Resume analysis and suggestions
- Interview preparation with technical and HR questions
- Job recommendation engine
- Career guidance chat
- Skill gap analysis

## 🏗️ Tech Stack

### Frontend
- React.js 18+
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Axios
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Helmet (Security)
- Morgan (Logging)
- Express Rate Limiting
- CORS

### AI
- Groq API (llama-3.1-8b-instant model)

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- Groq API Key (get from https://console.groq.com)

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env and add your configuration
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Edit .env and add API base URL
npm run dev
```

## 🔑 Environment Variables

### Server (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-placement
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
GROQ_API_KEY=your_groq_api_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📚 Database Schema

### User Model
```
- name: String
- email: String (unique)
- password: String (hashed)
- phone: String
- role: enum ['student', 'recruiter', 'admin']
- profileImage: String
- isActive: Boolean
- timestamps
```

### StudentProfile Model
```
- userId: Reference to User
- studentId: String
- department: enum
- course: String
- year: Number
- cgpa: Number
- skills: [String]
- technicalSkills: [String]
- projects: [Object]
- internships: [Object]
- resume: String
- backlogs: Number
- placementStatus: enum ['Not Placed', 'Placed', 'Not Eligible']
- timestamps
```

### Company Model
```
- recruiterId: Reference to User
- companyName: String
- logo: String
- description: String
- website: String
- industry: String
- location: String
- email: String
- phone: String
- companySize: enum
- isVerified: Boolean
- timestamps
```

### Job Model
```
- companyId: Reference to Company
- recruiterId: Reference to User
- title: String
- description: String
- location: String
- jobType: enum ['Full Time', 'Internship', 'Part Time']
- workMode: enum ['On-site', 'Remote', 'Hybrid']
- salary: String
- experience: String
- requiredSkills: [String]
- eligibleDepartments: [String]
- minimumCGPA: Number
- maximumBacklogs: Number
- applicationDeadline: Date
- status: enum ['Pending', 'Approved', 'Rejected', 'Closed']
- timestamps
```

### Application Model
```
- studentId: Reference to StudentProfile
- jobId: Reference to Job
- companyId: Reference to Company
- resume: String
- coverLetter: String
- status: enum ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected']
- appliedAt: Date
- interviewDate: Date
- interviewMode: enum ['Online', 'Offline']
- interviewLocation: String
- remarks: String
- timestamps
```

### Announcement Model
```
- title: String
- description: String
- createdBy: Reference to User
- priority: enum ['Low', 'Medium', 'High', 'Urgent']
- targetAudience: enum ['All', 'Students', 'Recruiters', 'Admins']
- timestamps
```

### PlacementDrive Model
```
- companyId: Reference to Company
- jobId: Reference to Job
- title: String
- description: String
- date: Date
- time: String
- venue: String
- eligibleDepartments: [String]
- minimumCGPA: Number
- status: enum ['Upcoming', 'Ongoing', 'Completed', 'Cancelled']
- timestamps
```

## 🚀 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
```

### Users
```
GET    /api/users/profile
PUT    /api/users/profile
```

### Students
```
GET    /api/students/profile
PUT    /api/students/profile
GET    /api/students/applications
GET    /api/students/recommended-jobs
```

### Jobs
```
GET    /api/jobs
GET    /api/jobs/:id
POST   /api/jobs (recruiter)
PUT    /api/jobs/:id (recruiter)
DELETE /api/jobs/:id (recruiter)
GET    /api/jobs/recruiter/my-jobs
```

### Applications
```
POST   /api/applications (student)
GET    /api/applications
GET    /api/applications/:id
PUT    /api/applications/:id/status (recruiter/admin)
GET    /api/applications/recruiter/applications
```

### Companies
```
GET    /api/companies
GET    /api/companies/:id
POST   /api/companies (recruiter)
PUT    /api/companies/:id (recruiter)
DELETE /api/companies/:id (recruiter)
GET    /api/companies/recruiter/company
```

### Announcements
```
GET    /api/announcements
POST   /api/announcements (admin)
PUT    /api/announcements/:id (admin)
DELETE /api/announcements/:id (admin)
```

### Placement Drives
```
GET    /api/drives
GET    /api/drives/:id
POST   /api/drives (admin)
PUT    /api/drives/:id (admin)
DELETE /api/drives/:id (admin)
```

### Admin
```
GET    /api/admin/dashboard
GET    /api/admin/students
GET    /api/admin/recruiters
GET    /api/admin/applications
GET    /api/admin/analytics
PUT    /api/admin/companies/:id/verify
PUT    /api/admin/jobs/:id/approve
PUT    /api/admin/jobs/:id/reject
```

### AI Services
```
POST   /api/ai/chat
POST   /api/ai/resume-analysis
POST   /api/ai/interview-preparation
POST   /api/ai/job-recommendation
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting on sensitive endpoints
- CORS configuration
- Helmet middleware for HTTP headers
- Input validation and sanitization
- MongoDB injection protection
- Secure error handling
- No sensitive data in logs
- Environment-based configuration

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Connect your repository to Vercel/Netlify
3. Set `VITE_API_BASE_URL` environment variable
4. Deploy automatically

### Backend Deployment (Render/Railway)
1. Connect GitHub repository
2. Set environment variables:
   - MONGO_URI
   - JWT_SECRET
   - GROQ_API_KEY
   - CLIENT_URL
   - NODE_ENV=production
3. Deploy

### Database
- Use MongoDB Atlas for cloud hosting
- Configure network access and whitelisting
- Create backups regularly

## 📊 Project Structure

```
smart-college-placement/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

## 🧪 Testing

### API Testing
Use Postman or similar tools with the following test flow:
1. Register a student account
2. Login and get JWT token
3. Complete student profile
4. Register recruiter account
5. Create company profile
6. Post a job
7. Apply for job as student
8. Track application status

### Frontend Testing Flow
1. Navigate to landing page
2. Register as student
3. Complete profile
4. Browse jobs
5. Apply for jobs
6. Check application status
7. Try AI assistant features

## 🔄 Future Enhancements

- Email notifications
- Video interview integration
- Resume file upload
- Skill verification
- Mock interview practice
- Company reviews by students
- Salary negotiation guidance
- Placement success metrics
- Advanced analytics dashboard
- Mobile application
- Social login integration
- Two-factor authentication

## 📝 License

MIT License

## 👥 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📞 Support

For issues and questions, please open an issue on GitHub or contact support.

---

**Built with ❤️ using MERN Stack**
