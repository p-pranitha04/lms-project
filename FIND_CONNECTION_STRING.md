# How to Find Supabase Connection String

Based on what you're seeing, here's where to find your connection string:

## Method 1: Look Above the Settings Section

The connection string is usually shown **ABOVE** the Database Settings section you're currently viewing.

1. Scroll **UP** on the Database Settings page
2. Look for a section called:
   - **"Connection string"**
   - **"Connection info"**
   - **"Database URL"**
   - **"Connect to your database"**

## Method 2: Check the Database Tab (Not Settings)

1. Click **"Database"** in the left sidebar (not Settings → Database)
2. Look for a **"Connect"** button or **"Connection string"** section
3. This is usually at the top of the Database page

## Method 3: Build It Manually

If you can't find it, we can build it! I need:

1. **Your project reference** (looks like: `abcdefghijklmnop`)
   - Found in: Project Settings → General → Reference ID
   - Or in your project URL: `https://supabase.com/dashboard/project/abcdefghijklmnop`

2. **Your database password** (the one you created when setting up the project)

3. **Region** (optional, but helpful)
   - Found in: Project Settings → General → Region

Then the connection string format is:
```
postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

## Quick Check: Project Reference

1. Look at your browser URL when in Supabase dashboard
2. It should look like: `https://supabase.com/dashboard/project/abcdefghijklmnop`
3. The part after `/project/` is your project reference
