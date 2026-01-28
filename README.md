# LMS Platform - Learning Management System

A Canvas-like Learning Management System built with Next.js, Express.js, and PostgreSQL.

## Features

- **User Authentication**: Role-based access (Student, Instructor, Admin)
- **Course Management**: Create, enroll, and manage courses
- **Assignments**: Create assignments, submit work, and grade submissions
- **Announcements**: Post course announcements
- **Calendar**: View upcoming assignments and deadlines
- **Gradebook**: Track grades and provide feedback
- **File Uploads**: Submit assignments with file attachments

## Tech Stack

### Frontend
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Icons** - Icon library
- **date-fns** - Date formatting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (or use free cloud options below)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd lms-project
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up the database**

   **Option A: Free PostgreSQL Cloud Databases**
   
   - **Neon** (Recommended): https://neon.tech
     - Sign up for free
     - Create a new project
     - Copy the connection string
   
   - **Supabase**: https://supabase.com
     - Sign up for free
     - Create a new project
     - Go to Settings > Database > Connection string
   
   - **Railway**: https://railway.app
     - Sign up for free
     - Create PostgreSQL database
     - Copy connection string

   **Option B: Local PostgreSQL**
   ```bash
   # Install PostgreSQL locally
   # Create database
   createdb lms_db
   ```

4. **Configure environment variables**

   Create `backend/.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   FRONTEND_URL=http://localhost:3000
   ```

   Create `frontend/.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

5. **Initialize the database**
   ```bash
   cd backend
   npm run init-db
   ```

6. **Start the development servers**
   ```bash
   # From root directory
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

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Accounts

After initializing the database, you can use these default accounts:

- **Admin**: admin@lms.com / admin123
- **Instructor**: instructor@lms.com / instructor123
- **Student**: student@lms.com / student123

## Project Structure

```
lms-project/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/       # Auth middleware
│   ├── routes/          # API routes
│   ├── scripts/         # Database initialization
│   ├── uploads/         # File uploads directory
│   └── server.js        # Express server
├── frontend/
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   └── utils/           # Utility functions
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Instructor/Admin)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:id/enroll` - Enroll in course (Student)
- `DELETE /api/courses/:id/enroll` - Unenroll from course

### Assignments
- `GET /api/assignments/course/:courseId` - Get assignments for course
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments` - Create assignment (Instructor/Admin)
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Submissions
- `GET /api/submissions/assignment/:assignmentId` - Get submissions (Instructor)
- `GET /api/submissions/assignment/:assignmentId/my-submission` - Get student's submission
- `POST /api/submissions` - Submit assignment (Student)

### Grades
- `GET /api/grades/course/:courseId` - Get grades for course
- `POST /api/grades` - Grade a submission (Instructor/Admin)

### Announcements
- `GET /api/announcements/course/:courseId` - Get announcements
- `POST /api/announcements` - Create announcement (Instructor/Admin)
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

## Deployment

### Free Hosting Options

#### Frontend Deployment

1. **Vercel** (Recommended for Next.js)
   - Sign up at https://vercel.com
   - Connect your GitHub repository
   - Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com/api`
   - Deploy automatically on push

2. **Netlify**
   - Sign up at https://netlify.com
   - Connect repository
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/.next`

3. **GitHub Pages**
   - Use Next.js static export
   - Deploy to GitHub Pages

#### Backend Deployment

1. **Railway** (Recommended)
   - Sign up at https://railway.app
   - Create new project from GitHub
   - Add PostgreSQL database
   - Set environment variables
   - Deploy automatically

2. **Render**
   - Sign up at https://render.com
   - Create new Web Service
   - Connect GitHub repository
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`
   - Add PostgreSQL database
   - Set environment variables

3. **Fly.io**
   - Sign up at https://fly.io
   - Install flyctl CLI
   - Run `fly launch` in backend directory
   - Configure PostgreSQL

4. **Heroku** (Limited free tier)
   - Sign up at https://heroku.com
   - Create new app
   - Add PostgreSQL addon
   - Deploy via Git

#### Database Options (Free)

1. **Neon** - https://neon.tech (Recommended)
   - Free tier: 0.5 GB storage
   - Auto-scaling
   - Serverless PostgreSQL

2. **Supabase** - https://supabase.com
   - Free tier: 500 MB database
   - Includes authentication and storage

3. **Railway PostgreSQL**
   - Free tier available
   - Easy integration with Railway deployments

4. **ElephantSQL** - https://www.elephantsql.com
   - Free tier: 20 MB database
   - Good for small projects

### Deployment Steps

1. **Prepare for production**
   - Update `JWT_SECRET` to a strong random string
   - Set `NODE_ENV=production`
   - Update CORS settings in backend
   - Configure file upload storage (consider cloud storage for production)

2. **Deploy Backend**
   ```bash
   # Example for Railway
   cd backend
   # Set environment variables in Railway dashboard
   # DATABASE_URL, JWT_SECRET, FRONTEND_URL, etc.
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   # Set NEXT_PUBLIC_API_URL to your backend URL
   npm run build
   ```

4. **Initialize Production Database**
   ```bash
   # Run database initialization script
   cd backend
   npm run init-db
   ```

### Recommended Full-Stack Deployment

**Option 1: Vercel (Frontend) + Railway (Backend)**
- Frontend: Deploy to Vercel
- Backend: Deploy to Railway
- Database: Use Railway PostgreSQL or Neon

**Option 2: Render (Both)**
- Deploy both frontend and backend to Render
- Use Render PostgreSQL database

**Option 3: Fly.io (Both)**
- Deploy both services to Fly.io
- Use Fly.io PostgreSQL or external database

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_strong_random_secret_key
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

## File Storage

For production, consider using cloud storage:
- **AWS S3** (with free tier)
- **Cloudinary** (free tier available)
- **Supabase Storage** (free tier)
- **Google Cloud Storage** (free tier)

Update `backend/routes/submissions.js` to use cloud storage instead of local files.

## Security Considerations

- Change default JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Use environment variables for sensitive data
- Implement proper CORS policies
- Add file type validation for uploads
- Consider adding CSRF protection

## Future Enhancements

- Email notifications
- Discussion forums
- Video conferencing integration
- Mobile app
- Advanced analytics
- Plagiarism detection
- Quiz/exam features
- Grade statistics
- Course materials library

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.
