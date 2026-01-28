# Quick Start Guide

Get your LMS platform running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A free PostgreSQL database (we'll help you get one)

## Step 1: Get a Free Database (2 minutes)

Choose one:

**Option A: Neon (Easiest)**
1. Go to https://neon.tech
2. Click "Sign Up" (free)
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)

**Option B: Supabase**
1. Go to https://supabase.com
2. Sign up and create project
3. Go to Settings > Database > Connection string
4. Copy the connection string

## Step 2: Install Dependencies (1 minute)

```bash
cd lms-project
npm run install:all
```

## Step 3: Configure Backend (1 minute)

1. Create `backend/.env` file:
```bash
cd backend
cp .env.example .env  # If .env.example exists, or create manually
```

2. Edit `backend/.env` and add your database URL:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=your_neon_or_supabase_connection_string_here
JWT_SECRET=change-this-to-random-string-in-production
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:3000
```

## Step 4: Initialize Database (30 seconds)

```bash
cd backend
npm run init-db
```

You should see:
- ✅ Database tables created successfully
- ✅ Default admin user created
- ✅ Default instructor created
- ✅ Default student created

## Step 5: Configure Frontend (30 seconds)

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Step 6: Start the Application (30 seconds)

From the root directory:
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## Step 7: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Login with Default Accounts

- **Admin**: admin@lms.com / admin123
- **Instructor**: instructor@lms.com / instructor123  
- **Student**: student@lms.com / student123

## What's Next?

1. **Create a Course** (as Instructor)
   - Login as instructor@lms.com
   - Go to Courses → Create Course
   - Fill in course details

2. **Enroll in Course** (as Student)
   - Login as student@lms.com
   - Browse courses and click "Enroll"

3. **Create Assignment** (as Instructor)
   - Go to your course
   - Click "Create Assignment"
   - Set due date and points

4. **Submit Assignment** (as Student)
   - Go to assignment
   - Write submission content
   - Upload file (optional)
   - Click "Submit"

5. **Grade Submission** (as Instructor)
   - View submissions
   - Assign points and feedback
   - Save grade

## Troubleshooting

### Database Connection Error
- Check your DATABASE_URL is correct
- For Neon/Supabase, make sure to include SSL: `?sslmode=require`
- Test connection: Try connecting with a PostgreSQL client

### Port Already in Use
- Change PORT in backend/.env to another port (e.g., 5001)
- Update FRONTEND_URL accordingly

### Module Not Found
- Run `npm install` in both frontend and backend directories
- Delete node_modules and reinstall if needed

### CORS Errors
- Make sure FRONTEND_URL in backend/.env matches your frontend URL
- Check that backend is running on correct port

## Need Help?

Check the main README.md for detailed documentation and deployment guide.
