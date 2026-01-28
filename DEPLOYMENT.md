# Deployment Guide

This guide will help you deploy your LMS application to free hosting platforms.

## Quick Deployment Summary

### Recommended Stack (All Free)

1. **Frontend**: Vercel (Best for Next.js)
2. **Backend**: Railway or Render
3. **Database**: Neon PostgreSQL or Supabase

## Step-by-Step Deployment

### 1. Database Setup (Choose One)

#### Option A: Neon (Recommended)
1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)
5. Save this for backend configuration

#### Option B: Supabase
1. Go to https://supabase.com
2. Sign up and create new project
3. Go to Settings > Database
4. Copy the connection string
5. Save this for backend configuration

### 2. Backend Deployment

#### Using Railway (Recommended)

1. **Sign up**: https://railway.app
2. **Create New Project** from GitHub
3. **Add PostgreSQL** database (or use external Neon/Supabase)
4. **Configure Environment Variables**:
   ```
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=generate_a_random_string_here
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
5. **Set Root Directory**: `backend`
6. **Build Command**: `npm install`
7. **Start Command**: `npm start`
8. **Deploy** and copy the backend URL

#### Using Render

1. **Sign up**: https://render.com
2. **Create New Web Service**
3. **Connect GitHub** repository
4. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
5. **Add PostgreSQL** database (or use external)
6. **Set Environment Variables** (same as Railway)
7. **Deploy** and copy the backend URL

### 3. Frontend Deployment

#### Using Vercel (Recommended)

1. **Sign up**: https://vercel.com
2. **Import Project** from GitHub
3. **Configure**:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   ```
   (Use your actual backend URL)
5. **Deploy**
6. Copy the frontend URL

#### Using Netlify

1. **Sign up**: https://netlify.com
2. **Add New Site** from Git
3. **Configure**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/.next`
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url/api
   ```
5. **Deploy**

### 4. Initialize Production Database

After deploying backend, run database initialization:

**Option 1: Via Railway/Render Console**
- Open your backend service console
- Run: `npm run init-db`

**Option 2: Via Local Connection**
```bash
# Update backend/.env with production DATABASE_URL
cd backend
npm run init-db
```

### 5. Update CORS Settings

Update `backend/server.js` to allow your frontend domain:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
  credentials: true
}));
```

### 6. Update Frontend API URL

Make sure `frontend/.env.local` (or Vercel environment variables) has:
```
NEXT_PUBLIC_API_URL=https://your-backend-url/api
```

## Free Tier Limits

### Vercel
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Perfect for Next.js

### Railway
- ✅ $5 free credit/month
- ✅ Auto-scaling
- ✅ Easy PostgreSQL integration

### Render
- ✅ Free tier available
- ⚠️ Spins down after inactivity (15 min free tier)
- ✅ PostgreSQL included

### Neon
- ✅ 0.5 GB storage free
- ✅ Auto-scaling
- ✅ Serverless PostgreSQL

### Supabase
- ✅ 500 MB database free
- ✅ Includes auth and storage
- ✅ Good free tier

## Production Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_URL in backend
- [ ] Update NEXT_PUBLIC_API_URL in frontend
- [ ] Initialize production database
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Configure CORS properly
- [ ] Set up error monitoring (optional)
- [ ] Enable HTTPS (automatic on Vercel/Railway/Render)

## Troubleshooting

### CORS Errors
- Make sure FRONTEND_URL matches your actual frontend domain
- Check that backend allows credentials

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check if database requires SSL (add `?sslmode=require`)

### File Upload Issues
- For production, consider cloud storage (AWS S3, Cloudinary)
- Local uploads work but may not persist on serverless platforms

### Environment Variables Not Working
- Restart services after changing env vars
- Check variable names match exactly
- For Next.js, prefix with `NEXT_PUBLIC_` for client-side vars

## Alternative: Single Platform Deployment

### Render (Full Stack)
- Deploy both frontend and backend to Render
- Use Render PostgreSQL
- Everything in one place

### Fly.io (Full Stack)
- Deploy both services
- Use Fly PostgreSQL or external database
- Good for Docker deployments

## Cost Estimate

**All Free Tier:**
- Frontend: $0 (Vercel)
- Backend: $0 (Railway/Render free tier)
- Database: $0 (Neon/Supabase free tier)
- **Total: $0/month**

For higher traffic, consider:
- Railway: ~$5-10/month
- Render: ~$7/month (no spin-down)
- Vercel Pro: $20/month (if needed)

## Support

If you encounter issues:
1. Check service logs (Railway/Render/Vercel dashboards)
2. Verify environment variables
3. Test API endpoints directly
4. Check database connection
5. Review CORS settings
