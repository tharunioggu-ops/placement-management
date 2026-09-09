# Environment Setup & Deployment Checklist

## ✅ Pre-Deployment Verification Checklist

### Backend Setup
```bash
# 1. Backend Dependencies Installed
cd server
npm install
# Check: node_modules folder exists, package-lock.json created

# 2. Environment Variables Configured
cp .env.example .env
# Set:
#   - PORT=5000
#   - MONGO_URI=<your_mongodb_connection_string>
#   - JWT_SECRET=<strong_random_string>
#   - GROQ_API_KEY=<your_groq_api_key>
#   - CLIENT_URL=<frontend_url>
#   - NODE_ENV=development

# 3. Database Connection Test
npm run dev
# Should see: "Successfully connected to MongoDB"
# Should see: "Server running on port 5000"

# 4. Health Check
curl http://localhost:5000/health
# Response: {"success":true,"message":"API is running"}

# 5. Test Endpoint
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456","role":"student","phone":"9876543210"}'
```

### Frontend Setup
```bash
# 1. Frontend Dependencies Installed
cd client
npm install
# Check: node_modules folder exists, package-lock.json created

# 2. Environment Variables Configured
cp .env.example .env
# Set:
#   - VITE_API_BASE_URL=http://localhost:5000/api

# 3. Development Server Test
npm run dev
# Should see: "VITE v5.0.0+ ready in XXX ms"
# Should see: "Local: http://localhost:5173"

# 4. Build Test
npm run build
# Should see: "dist/index.html" created
# No errors in build output

# 5. Verify Asset Loading
# Check that Tailwind CSS is applied (blue accent colors)
# Check that Framer Motion animations work
```

### Database Setup
```bash
# Option 1: Local MongoDB
# 1. Install MongoDB Community Edition
# 2. Start MongoDB service
#    Windows: net start MongoDB
#    Mac: brew services start mongodb-community
#    Linux: sudo systemctl start mongod

# 3. Test connection
mongo mongodb://localhost:27017/
# Should connect without errors

# Option 2: MongoDB Atlas (Cloud)
# 1. Create account at mongodb.com
# 2. Create cluster (free tier available)
# 3. Create database user with password
# 4. Whitelist IP addresses (or allow 0.0.0.0/0 for dev)
# 5. Get connection string: mongodb+srv://user:password@cluster.mongodb.net/dbname
# 6. Add to MONGO_URI in .env

# 4. Verify Collections Created
#    Should see on first run:
#    - users
#    - studentprofiles
#    - companies
#    - jobs
#    - applications
#    - placementdrives
#    - announcements
```

### AI Integration (Groq API)
```bash
# 1. Get Groq API Key
#    - Visit: https://console.groq.com/keys
#    - Create new API key
#    - Copy and save securely

# 2. Add to .env
GROQ_API_KEY=<your_groq_api_key>

# 3. Test Groq Integration
# Make request to AI endpoint:
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","studentId":"<student_id>"}'

# Should receive AI response (not an error)
```

---

## 🚀 Local Development Testing

### User Registration Flow
```
1. Open http://localhost:5173
2. Click "Get Started" → Navigate to /register
3. Fill form:
   - Name: John Student
   - Email: student@example.com
   - Password: Password123!
   - Role: Student
   - Phone: 9876543210
4. Click Register
5. Should redirect to /login
6. Login with credentials
7. Should see StudentDashboard
```

### Student Feature Testing
```
✓ Profile Management
  - Go to /student/profile
  - Edit academic details (CGPA, department)
  - Edit personal details (phone, city)
  - Add skills and technical skills
  - See profile completion percentage

✓ Browse Jobs
  - Go to /student/jobs
  - See job listings with filters
  - Apply for a job (if eligible)
  - See eligibility badge changes based on CGPA

✓ Application Tracking
  - Go to /student/applications
  - See submitted applications
  - Filter by status
  - View interview details if scheduled

✓ AI Assistant
  - Go to /student/ai-assistant
  - Try different modes:
    * General Chat
    * Resume Analysis
    * Interview Preparation
    * Job Recommendation
  - Should receive AI responses
```

### Admin Testing
```
1. Register recruiter account:
   - Email: recruiter@example.com
   - Role: Recruiter

2. Create company profile:
   - Fill company details
   - Submit

3. Login as admin (create admin account):
   - Go to /admin/dashboard
   - Should see statistics
   - Verify company (search company, click verify)
   - Approve jobs (find pending jobs, approve)
```

---

## 📋 Production Deployment Checklist

### Code Quality
```
✓ No console.log() statements in production code
✓ No TODO or FIXME comments with critical issues
✓ All error handling in place
✓ No hardcoded secrets in code
✓ Environment variables used for all config
✓ Input validation on all endpoints
✓ Database indexes created
✓ CORS properly configured
✓ HTTPS enabled (SSL certificate)
```

### Security
```
✓ JWT_SECRET is strong (>32 characters)
✓ API keys rotated and not exposed
✓ HTTPS everywhere
✓ CORS allows only your domain
✓ Rate limiting enabled
✓ Helmet middleware active
✓ Password hashing enabled
✓ SQL/NoSQL injection protection
✓ CSRF protection if needed
✓ Sensitive data not logged
```

### Performance
```
✓ Database indexes on frequently queried fields:
  - User: email (unique)
  - Application: (studentId, jobId) (unique)
  - Job: status, createdAt
  - StudentProfile: userId (unique)

✓ Frontend optimizations:
  - Bundle size < 500KB (gzipped)
  - Lazy loading implemented
  - Images optimized
  - Unused dependencies removed

✓ Backend optimizations:
  - API response times < 500ms
  - Database queries optimized
  - Pagination implemented for large datasets
  - Caching where appropriate
```

### Scalability
```
✓ Stateless API (can scale horizontally)
✓ Database can handle growth (indexes, sharding ready)
✓ Load balancer configured
✓ Auto-scaling policies set
✓ CDN for static assets
✓ Database backups automated
```

---

## 🔐 Environment Variables Verification

### Backend .env
```bash
# ✓ Must have these variables
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_very_long_secure_random_key_min_32_chars
GROQ_API_KEY=your_groq_api_key_from_console
CLIENT_URL=https://yourdomain.com (production)
NODE_ENV=production

# Optional but recommended
LOG_LEVEL=error
API_VERSION=1.0
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### Frontend .env
```bash
# ✓ Must have
VITE_API_BASE_URL=https://api.yourdomain.com (production)

# Optional
VITE_APP_NAME=SmartPlacement
VITE_API_TIMEOUT=30000
```

### Secrets Management
```
✓ Never commit .env files to git
✓ Use environment variable injection on production server
✓ Rotate secrets every 90 days
✓ Use different secrets for dev/prod/staging
✓ Store secrets in secure vault (AWS Secrets Manager, Vault, etc.)
✓ Don't share secrets in logs or error messages
```

---

## 📊 Performance Benchmarks

### Expected Response Times
```
GET /jobs                          < 200ms
GET /students/profile              < 150ms
POST /applications                 < 300ms
GET /admin/dashboard               < 500ms
POST /ai/chat                      < 2000ms (AI processing)
GET /jobs with filters             < 300ms
```

### Database Performance
```
Query optimization:
✓ Indexed fields are used in queries
✓ Compound indexes for multi-field queries
✓ Explain plan reviewed
✓ No N+1 queries
✓ Pagination for large result sets

Indexes created:
- users: email (unique)
- studentprofiles: userId (unique)
- applications: (studentId, jobId) (unique), status, jobId
- jobs: status, companyId, createdAt
- companies: recruiterId
```

### Frontend Performance
```
✓ Lighthouse score > 90
✓ First Contentful Paint < 1.5s
✓ Largest Contentful Paint < 2.5s
✓ Cumulative Layout Shift < 0.1
✓ Time to Interactive < 3s
```

---

## 🌍 Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend)

**Frontend Deploy (Vercel)**
```
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - VITE_API_BASE_URL=https://your-backend.onrender.com/api
4. Auto-deploys on push
5. Get URL: https://yourapp.vercel.app
```

**Backend Deploy (Render)**
```
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables (add all from .env)
5. Set build command: cd server && npm install
6. Set start command: node server.js
7. Wait for deployment
8. Get URL: https://your-backend.onrender.com
```

### Option 2: Heroku (Full Stack Alternative)
```
1. Install Heroku CLI
2. Login: heroku login
3. Create app: heroku create your-app-name
4. Set buildpacks:
   heroku buildpacks:set heroku/nodejs
5. Set environment variables:
   heroku config:set JWT_SECRET=xxx
   heroku config:set MONGO_URI=xxx
   etc.
6. Deploy: git push heroku main
```

### Option 3: Self-Hosted (VPS/Dedicated Server)
```
1. SSH into server
2. Install Node.js, MongoDB, Nginx
3. Clone repository
4. Install dependencies
5. Setup .env files
6. Start backend: pm2 start server.js
7. Setup Nginx reverse proxy
8. Configure SSL with Let's Encrypt
9. Setup auto-restart with systemd
```

---

## 🧪 Post-Deployment Testing

### Smoke Tests
```bash
# 1. Health Check
curl https://api.yourdomain.com/health
# Should return: {"success":true}

# 2. Register New User
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@yourdomain.com","password":"Test123!","role":"student","phone":"1234567890"}'

# 3. Login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@yourdomain.com","password":"Test123!"}'

# 4. Verify Frontend Loads
curl -I https://yourapp.vercel.app
# Should return 200 status

# 5. Test API Connection from Frontend
# Open browser console and check:
# - No CORS errors
# - JWT tokens being sent
# - API responses received
```

### Functional Tests
```
✓ User Registration and Login working
✓ Student Profile Creation successful
✓ Job Browsing and Filtering working
✓ Job Applications submitting correctly
✓ AI Assistant responding properly
✓ Admin Dashboard loading data
✓ Company Verification workflow
✓ Job Approval workflow
✓ Database operations working
✓ Email notifications (if implemented)
```

### Security Tests
```
✓ HTTPS enabled and certificates valid
✓ No sensitive data in URLs/logs
✓ Authentication required for protected routes
✓ Authorization working (role-based access)
✓ Rate limiting active
✓ CORS properly restricted
✓ No SQL/NoSQL injection vulnerabilities
✓ XSS protection in place
✓ CSRF tokens if needed
✓ Password requirements enforced
```

---

## 📈 Monitoring & Maintenance

### Monitoring Setup
```
✓ Error tracking (Sentry, Rollbar)
✓ Performance monitoring (New Relic, DataDog)
✓ Uptime monitoring (UptimeRobot, Pingdom)
✓ Log aggregation (LogRocket, Loggly)
✓ Database monitoring
✓ API analytics and metrics
```

### Regular Maintenance
```
Daily:
  ✓ Check error logs
  ✓ Monitor uptime
  ✓ Review performance metrics

Weekly:
  ✓ Backup database
  ✓ Review analytics
  ✓ Check for security updates

Monthly:
  ✓ Update dependencies (npm update)
  ✓ Security audit
  ✓ Performance optimization review
  ✓ User feedback review

Quarterly:
  ✓ Penetration testing
  ✓ Full backup restore test
  ✓ Disaster recovery drill
  ✓ Compliance audit
```

### Backup Strategy
```
✓ Database backups: Daily
✓ Code backups: On every commit to Git
✓ Backup retention: 30 days minimum
✓ Test restore process: Monthly
✓ Multi-region redundancy: Recommended for production
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Render
        uses: chrnorm/deployment-action@v2
        with:
          token: ${{ secrets.DEPLOY_TOKEN }}
          environment: production
```

---

## 📞 Troubleshooting Deployment

| Issue | Solution |
|-------|----------|
| CORS errors | Check CLIENT_URL in backend .env matches frontend URL |
| 404 Not Found | Verify routes are correctly defined in server.js |
| 500 Server Error | Check .env variables, MongoDB connection, API keys |
| Slow API | Check database indexes, review slow queries, add caching |
| Frontend blank page | Check VITE_API_BASE_URL, check browser console |
| AI not working | Verify GROQ_API_KEY is valid and has quota |
| Database connection fails | Check MONGO_URI, IP whitelist, authentication |

---

## ✅ Final Production Readiness Checklist

```
Code Quality & Testing
  ☐ All code reviewed
  ☐ Unit tests passing
  ☐ Integration tests passing
  ☐ E2E tests passing
  ☐ No console errors/warnings
  
Security
  ☐ All secrets in environment variables
  ☐ HTTPS enabled
  ☐ CORS configured correctly
  ☐ Rate limiting active
  ☐ Authentication working
  ☐ Authorization working
  ☐ Input validation active
  
Performance
  ☐ Database indexes created
  ☐ Query optimization complete
  ☐ Bundle size optimized
  ☐ Images compressed
  ☐ Caching configured
  
Infrastructure
  ☐ Domain configured
  ☐ SSL certificates installed
  ☐ CDN configured
  ☐ Load balancer active
  ☐ Auto-scaling configured
  
Monitoring & Logging
  ☐ Error tracking set up
  ☐ Performance monitoring active
  ☐ Uptime monitoring active
  ☐ Log aggregation working
  ☐ Alerting configured
  
Backup & Disaster Recovery
  ☐ Database backups automated
  ☐ Backup retention verified
  ☐ Restore tested
  ☐ DR plan documented
  ☐ Team trained on procedures
  
Documentation
  ☐ API documentation complete
  ☐ Architecture documentation complete
  ☐ Deployment guide written
  ☐ Runbook created
  ☐ Team training completed
```

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** Production Ready ✅
