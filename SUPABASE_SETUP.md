# Supabase Setup - Step by Step Guide

## Step 1: Sign Up for Supabase

1. Go to **https://supabase.com**
2. Click **"Start your project"** (top right)
3. Sign up with:
   - **GitHub** (recommended - fastest)
   - **Email** (alternative)

## Step 2: Create a New Project

1. After signing in, click **"New Project"** (green button)
2. Fill in the form:
   - **Name**: `lms-project` (or any name)
   - **Database Password**: 
     - Create a STRONG password (save it somewhere safe!)
     - You'll need this password for the connection string
   - **Region**: Choose closest to you
     - Examples: US East, US West, EU West, etc.
3. Click **"Create new project"**
4. ⏳ Wait 1-2 minutes for project to be created

## Step 3: Find Your Connection String

### Option A: Via Settings (Recommended)

1. In your Supabase dashboard, look at the **left sidebar**
2. Scroll down and click **⚙️ Settings** (gear icon at bottom)
3. Click **"Database"** in the settings menu
4. Scroll down to find **"Connection string"** section
5. You'll see different connection types:
   - **Direct connection** (use this one)
   - **Session pooler**
   - **Transaction pooler**

### Option B: Via Database Tab

1. Click **"Database"** in the left sidebar
2. Look for a **"Connect"** button (usually at the top)
3. Click it to see connection information

### Option C: Via Project Settings

1. Click your **project name** (top left)
2. Select **"Project Settings"**
3. Click **"Database"** tab
4. Find **"Connection string"** section

## Step 4: Copy Your Connection String

You'll see something like this:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**Important**: Replace `[YOUR-PASSWORD]` with the actual password you created in Step 2!

**Example** (if your password was `MySecurePass123`):
```
postgresql://postgres:MySecurePass123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## Step 5: Update Your Project's .env File

1. Open `backend/.env` in Cursor
2. Find this line:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/lms_db
   ```
3. Replace it with your Supabase connection string:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
   ```
4. **Save the file** (Ctrl+S or Cmd+S)

## Step 6: Test the Connection

After updating `.env`, test your connection:

```bash
cd backend
npm run init-db
```

If successful, you'll see:
- ✅ Database tables created successfully
- ✅ Default admin user created
- ✅ Default instructor created
- ✅ Default student created

## Troubleshooting

### Can't Find Connection String?

**Look for these keywords:**
- "Connection string"
- "Connection info"
- "Database URL"
- "Connection URI"
- "Connect" button

**Where to look:**
- Settings → Database
- Database tab → Connect button
- Project Settings → Database

### Connection String Format

Your connection string should look like:
```
postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

**Parts explained:**
- `postgres` = username (always "postgres" for Supabase)
- `PASSWORD` = your database password
- `PROJECT_REF` = your unique project reference
- `5432` = port (standard PostgreSQL port)
- `postgres` = database name

### Still Stuck?

If you can't find it, try:
1. Take a screenshot of your Supabase dashboard
2. Tell me what you see in Settings → Database
3. Or use **Neon** instead (easier to find connection string)

## What's Next?

After you have your connection string:
1. ✅ Update `backend/.env` file
2. ✅ Run `npm run init-db`
3. ✅ Start your app with `npm run dev`

## Alternative: Use Neon Instead

If Supabase is confusing, **Neon** is easier:
- Go to https://neon.tech
- Sign up (free)
- Create project
- Connection string is right there on the dashboard!

Both are free and work perfectly for this project! 🚀
