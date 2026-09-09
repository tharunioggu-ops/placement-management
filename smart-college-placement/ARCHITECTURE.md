# Smart College Placement Platform - Architecture Guide

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (React.js)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Landing   │  │    Login    │  │   Student   │  │  Recruiter  │   │
│  │   Page      │  │  Register   │  │  Dashboard  │  │ Dashboard   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │    Job      │  │ Application │  │  Student    │  │     AI      │   │
│  │   Browsing  │  │  Tracking   │  │  Profile    │  │  Assistant  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│  ┌─────────────┐                                    ┌─────────────┐   │
│  │    Admin    │                                    │   Navbar    │   │
│  │  Dashboard  │                                    │   Footer    │   │
│  └─────────────┘                                    └─────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                    (HTTPS Requests/Responses)
                    (Axios + JWT Token)
                              │
┌─────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY & MIDDLEWARE                            │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  CORS | Rate Limiter | Authentication | Error Handling          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────────┐
│                    SERVER LAYER (Express.js)                            │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      ROUTE HANDLERS                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │   Auth   │  │  User    │  │  Student │  │   Job    │        │   │
│  │  │ Routes   │  │  Routes  │  │  Routes  │  │  Routes  │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │Application│ │ Company  │  │  Admin   │  │    AI    │        │   │
│  │  │  Routes   │  │  Routes  │  │  Routes  │  │  Routes  │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   CONTROLLERS (Business Logic)                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │AuthCtrl  │  │StudentCtrl│ │JobCtrl   │  │AppCtrl   │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │CompanyCtrl│ │AdminCtrl  │  │AICtrl    │  │...       │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    SERVICES & UTILITIES                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │ Validators│ │AsyncHandler│ │GenerateToken│ │...     │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     DATA ACCESS LAYER                           │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │              MONGOOSE MODELS                             │  │   │
│  │  │  User | StudentProfile | Company | Job | Application    │  │   │
│  │  │  PlacementDrive | Announcement                           │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER (MongoDB)                           │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Users      │  │   Companies  │  │    Jobs      │                  │
│  │  Collection  │  │  Collection  │  │  Collection  │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │StudentProfile│  │ Applications │  │ PlacementDrive                  │
│  │  Collection  │  │  Collection  │  │  Collection  │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│  ┌──────────────┐  ┌──────────────┐                                     │
│  │Announcements │  │  Indexes     │                                     │
│  │  Collection  │  │  & Queries   │                                     │
│  └──────────────┘  └──────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                                 │
│                                                                           │
│  ┌──────────────────────┐           ┌──────────────────────┐           │
│  │  GROQ AI API         │           │  Email Service       │           │
│  │  (llama-3.1-8b)      │           │  (Optional)          │           │
│  │  - Resume Analysis   │           │  - Notifications     │           │
│  │  - Interview Prep    │           │  - Alerts            │           │
│  │  - Job Recommendations           │                      │           │
│  └──────────────────────┘           └──────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### User Registration & Login Flow
```
┌──────────────┐
│   User Input │
│  (Email/PW) │
└──────────────┘
       │
       ↓
┌──────────────────────┐
│  React Form Handler  │
│  Validation          │
└──────────────────────┘
       │
       ↓
┌──────────────────────┐
│  POST /auth/register │
│  or /auth/login      │
│  (with Axios)        │
└──────────────────────┘
       │
       ↓
┌──────────────────────┐
│  Express Router      │
│  Rate Limiter Check  │
└──────────────────────┘
       │
       ↓
┌──────────────────────┐
│  Auth Controller     │
│  - Validate input    │
│  - Hash password     │
│  - Query database    │
└──────────────────────┘
       │
       ↓
┌──────────────────────┐
│  User Model          │
│  (MongoDB Query)     │
└──────────────────────┘
       │
       ↓
┌──────────────────────┐
│  Generate JWT        │
│  Return Token        │
└──────────────────────┘
       │
       ↓
┌──────────────────────┐
│  Store in            │
│  localStorage        │
├──────────────────────┤
│  Update AuthContext  │
│  Redirect to         │
│  Dashboard           │
└──────────────────────┘
```

### Job Application Flow
```
┌──────────────────┐
│  Student Views   │
│  Job Listing     │
└──────────────────┘
       │
       ↓
┌──────────────────────┐
│ Check Eligibility    │
│ (Frontend)           │
│ - CGPA check         │
│ - Backlog check      │
└──────────────────────┘
       │
       ↓
┌──────────────────────┐
│ POST /applications   │
│ (with JWT Token)     │
└──────────────────────┘
       │
       ↓
┌──────────────────────┐
│ Protect Middleware   │
│ Verify JWT Token     │
└──────────────────────┘
       │
       ↓
┌──────────────────────┐
│ Application          │
│ Controller           │
│ - Re-validate        │
│ - Check for dupes    │
└──────────────────────┘
       │
       ↓
┌──────────────────────┐
│ Create Application   │
│ Record in MongoDB    │
│ Status: "Applied"    │
└──────────────────────┘
       │
       ↓
┌──────────────────────┐
│ Return Success       │
│ Store in React State │
│ Show Success Toast   │
└──────────────────────┘
```

---

## 🔐 Authentication Flow

```
                    ┌──────────────────┐
                    │   User Login     │
                    └──────────────────┘
                            │
                            ↓
                ┌────────────────────────┐
                │  POST /auth/login      │
                │  {email, password}     │
                └────────────────────────┘
                            │
                            ↓
            ┌───────────────────────────────┐
            │  Find User in Database        │
            │  Compare password with hash   │
            └───────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
              ✓ Valid          ✗ Invalid
                    │               │
                    ↓               ↓
        ┌─────────────────┐  ┌──────────────┐
        │ Generate JWT    │  │ Return 401   │
        │ Token           │  │ Unauthorized │
        │ Expiry: 7 days  │  └──────────────┘
        └─────────────────┘
                    │
                    ↓
        ┌─────────────────────────┐
        │ Return Token + User Info│
        │ to Frontend             │
        └─────────────────────────┘
                    │
                    ↓
        ┌─────────────────────────┐
        │ Store Token in          │
        │ localStorage            │
        │ Store User in Context   │
        └─────────────────────────┘
                    │
                    ↓
        ┌─────────────────────────┐
        │ Axios Interceptor       │
        │ Adds token to all       │
        │ future requests         │
        └─────────────────────────┘

Protected Request Flow:
GET /api/students/profile with JWT Token
                │
                ↓
    ┌────────────────────────────┐
    │ authMiddleware.js          │
    │ - Extract token            │
    │ - Verify with JWT_SECRET   │
    │ - Attach user to request   │
    └────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
   ✓ Valid         ✗ Invalid
        │               │
        ↓               ↓
    ┌────────┐    ┌──────────┐
    │Proceed │    │Return 401│
    └────────┘    └──────────┘
        │
        ↓
    ┌─────────────────┐
    │Execute Controller
    │Return Data      │
    └─────────────────┘
```

---

## 🎯 Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────────────┐
│                    REQUEST                              │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
         ┌───────────────────────────────┐
         │  Extract JWT Token            │
         │  Decode to get user.role      │
         └───────────────────────────────┘
                         │
                         ↓
         ┌───────────────────────────────┐
         │  Authorize Middleware         │
         │  Check required roles         │
         └───────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
        STUDENT       RECRUITER       ADMIN
          │              │              │
          ↓              ↓              ↓
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │ Profile │   │  Jobs   │   │Analytics│
    │ Jobs    │   │  Applic  │   │Verify   │
    │Applica  │   │  Company │   │Approve  │
    │ AI Chat │   │Analytics │   │Announce │
    └─────────┘   └─────────┘   └─────────┘
          │              │              │
          └──────────────┼──────────────┘
                         ↓
         ┌───────────────────────────────┐
         │  Access Granted               │
         │  Execute Controller Logic     │
         └───────────────────────────────┘
                         │
                         ↓
         ┌───────────────────────────────┐
         │  Return Response with Data    │
         └───────────────────────────────┘
```

---

## 📝 Request/Response Cycle

```
CLIENT SIDE                          SERVER SIDE
═══════════════════════════════════════════════════════════

User Action
    │
    ↓
React Component
    │
    ↓
Service Function
(api.js / index.js)
    │
    ↓
Axios Instance
+ JWT Token
    │
    ↓
HTTP Request
────────────────────→  Route Handler
                            │
                            ↓
                        Middleware
                        - CORS
                        - Auth
                        - Rate Limit
                            │
                            ↓
                        Controller
                        - Validate
                        - Process
                        - Query DB
                            │
                            ↓
                        Model (Mongoose)
                        - Database Op
                        - Return Data
                            │
                            ↓
                        Format Response
                            │
                            ↓
                        Error Handler
                        (if needed)
                            │
                            ↓
                        HTTP Response
←────────────────────
    │
    ↓
Axios Response
    │
    ↓
Error/Catch Handler
    │
    ↓
Update State/Context
    │
    ↓
Re-render Component
    │
    ↓
Display Result
to User
```

---

## 🌳 Component Hierarchy

```
App.jsx
  ├── AuthProvider (Context)
  │   ├── ThemeProvider (Context)
  │   │   └── NotificationProvider (Context)
  │   │       ├── Navbar (Layout)
  │   │       ├── Routes
  │   │       │   ├── Public Routes
  │   │       │   │   ├── Landing
  │   │       │   │   ├── Login
  │   │       │   │   └── Register
  │   │       │   ├── Student Routes (ProtectedRoute)
  │   │       │   │   ├── StudentDashboard
  │   │       │   │   ├── StudentProfile
  │   │       │   │   ├── StudentJobs
  │   │       │   │   ├── StudentApplications
  │   │       │   │   └── AIAssistant
  │   │       │   ├── Recruiter Routes (ProtectedRoute)
  │   │       │   │   └── RecruiterDashboard
  │   │       │   └── Admin Routes (ProtectedRoute)
  │   │       │       └── AdminDashboard
  │   │       └── Footer (Layout)
  │
  └── Components (Reusable)
      ├── Button
      ├── Card
      ├── Modal
      ├── Badge
      ├── Spinner
      ├── Toast
      ├── EmptyState
      └── LoadingSpinner
```

---

## 🔌 API Request Pattern

### Frontend (React)
```javascript
// 1. Import service
import { studentService } from '../../services';

// 2. Use in component
useEffect(() => {
  studentService.getProfile()
    .then(res => setData(res.data))
    .catch(err => handleError(err));
}, []);

// 3. Make request
const res = await applicationService.createApplication(data);
```

### Backend (Express)
```javascript
// 1. Define route
router.post('/', protect, authorize('student'), createApplication);

// 2. Create controller
exports.createApplication = asyncHandler(async (req, res) => {
  // Validate
  // Process
  // Query DB
  // Return response
});

// 3. Use model
const app = await Application.create({ ... });
```

---

## 🎭 State Management

### React Context API
```
AuthContext
├── user (User object)
├── token (JWT token)
├── loading (Boolean)
├── isAuthenticated (Boolean)
└── Functions: login(), logout()

ThemeContext
├── isDark (Boolean)
└── Functions: toggleTheme()

NotificationContext
├── notifications (Array)
└── Functions: addNotification(), removeNotification()
```

### Component State
- Local state for forms
- useEffect for API calls
- Custom hooks for reusable logic

---

## 📊 Database Relationships

```
User (1) ──────────────── (1) StudentProfile
         └─ userId

User (1) ──────────────── (Many) Company
         └─ recruiterId

Company (1) ────────────── (Many) Job
           └─ companyId

Job (1) ────────────────── (Many) Application
       └─ jobId

StudentProfile (1) ────── (Many) Application
               └─ studentId

Company (1) ───────────── (Many) PlacementDrive
           └─ companyId

User (1) ───────────────── (Many) Announcement
       └─ createdBy
```

---

## 🔄 Environment Configuration

```
┌──────────────────────────────────────────┐
│         DEVELOPMENT (.env)               │
├──────────────────────────────────────────┤
│ PORT=5000                                │
│ MONGO_URI=mongodb://localhost:27017/...  │
│ NODE_ENV=development                     │
│ CLIENT_URL=http://localhost:5173         │
└──────────────────────────────────────────┘
              ↕ (Deploy)
┌──────────────────────────────────────────┐
│      PRODUCTION (.env on server)         │
├──────────────────────────────────────────┤
│ PORT=process.env.PORT                    │
│ MONGO_URI=mongodb+srv://...atlas.mongodb │
│ NODE_ENV=production                      │
│ CLIENT_URL=https://yourdomain.com        │
└──────────────────────────────────────────┘
```

---

## ✅ Complete Architecture Verified

This architecture ensures:
- ✓ Scalability
- ✓ Maintainability
- ✓ Security
- ✓ Performance
- ✓ Separation of Concerns
- ✓ Reusability
- ✓ Error Handling
- ✓ Proper Authentication/Authorization

---

**Architecture Last Updated:** 2024
