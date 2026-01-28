# Database Setup Guide

This guide will help you set up a **FREE** PostgreSQL database for your LMS project.

## Option 1: Neon (Recommended - Easiest)

### Step 1: Sign Up
1. Go to **https://neon.tech**
2. Click **"Sign Up"** (top right)
3. Sign up with **Google**, **GitHub**, or **Email** (no credit card required!)

### Step 2: Create a Project
1. After signing in, click **"Create a project"**
2. Fill in:
   - **Project name**: `lms-project` (or any name you like)
   - **Region**: Choose closest to you (e.g., US East, EU West)
   - **PostgreSQL version**: Latest (PostgreSQL 17)
3. Click **"Create project"**

### Step 3: Get Your Connection String
1. Once your project is created, you'll see the **Dashboard**
2. Look for **"Connection string"** section
3. You'll see something like:
   ```
   postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Copy this entire string** - this is your `DATABASE_URL`

### Step 4: Update Your .env File
1. Open `backend/.env` in Cursor
2. Replace the `DATABASE_URL` line with your copied connection string:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. **Save the file**

---

## Option 2: Supabase (Alternative)

### Step 1: Sign Up
1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with **GitHub** or **Email**

### Step 2: Create a Project
1. Click **"New Project"**
2. Fill in:
   - **Name**: `lms-project`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
3. Click **"Create new project"** (takes 1-2 minutes)

### Step 3: Get Your Connection String
1. Go to **Settings** (gear icon) → **Database**
2. Scroll to **"Connection string"** section
3. Select **"URI"** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you created
6. **Copy the complete string** - this is your `DATABASE_URL`

### Step 4: Update Your .env File
1. Open `backend/.env` in Cursor
2. Replace the `DATABASE_URL` line with your copied connection string
3. **Save the file**

---

## Quick Test: Verify Your Database Connection

After updating your `.env` file, test the connection:

```bash
cd backend
npm run init-db
```

If successful, you'll see:
- ✅ Database tables created successfully
- ✅ Default admin user created
- ✅ Default instructor created
- ✅ Default student created

---

## Troubleshooting

### Connection String Format
Your connection string should look like:
```
postgresql://username:password@host:port/database?sslmode=require
```

### Common Issues

**1. "Connection refused" or "ECONNREFUSED"**
- Check if your connection string is correct
- Make sure you copied the entire string
- For Neon: Make sure `?sslmode=require` is included

**2. "Password authentication failed"**
- Double-check your password
- For Supabase: Make sure you replaced `[YOUR-PASSWORD]` with actual password

**3. "Database does not exist"**
- For Neon: The database name is usually `neondb` or `defaultdb`
- For Supabase: The database name is usually `postgres`
- Check your connection string

**4. SSL Required**
- Most cloud databases require SSL
- Make sure your connection string includes `?sslmode=require`
- Example: `postgresql://...?sslmode=require`

---

## What's Next?

After setting up your database:

1. ✅ Update `backend/.env` with your `DATABASE_URL`
2. ✅ Run `npm run init-db` to create tables
3. ✅ Start your application with `npm run dev`
4. ✅ Login with default accounts (see README.md)

---

## Free Tier Limits

### Neon Free Tier
- ✅ 0.5 GB storage per branch
- ✅ 100 Compute Unit hours per project
- ✅ 5 GB data egress per month
- ✅ Perfect for development and small projects

### Supabase Free Tier
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth
- ✅ Unlimited API requests
- ✅ Great for getting started

Both are **completely free** and perfect for your LMS project!
