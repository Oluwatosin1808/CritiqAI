# 🔧 Complete Supabase Credentials Setup Guide

Your Critiq app is running at **http://localhost:3000** ✅

Now you need to fill in your Supabase credentials to make it fully functional.

## Step 1: Create Supabase Project

1. Go to **[https://app.supabase.com](https://app.supabase.com)**
2. Click **"New project"**
3. Fill in:
   - **Name**: `Critiq` (or any name)
   - **Password**: Create a strong password (you'll need this for database access)
   - **Region**: Choose your region (US East 1 is recommended)
4. Click **"Create new project"** and wait ~2 minutes for it to initialize

## Step 2: Get Your API Credentials

### Where to Find Them:

Once your project is created, go to **Settings → API**

You'll see a page like this:
```
Project URL
https://abc123def456.supabase.co

Your API keys
┌─────────────────────────────────────┐
│ anon public                         │
│ eyJhbGc...                          │
│ (Copy this)                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ service_role secret                 │
│ eyJhbGc...                          │
│ (Copy this - KEEP SECRET!)          │
└─────────────────────────────────────┘
```

### Copy These Three Values:

1. **Project URL** → `https://abc123def456.supabase.co`
2. **anon public key** → The first API key
3. **service_role secret** → The second API key (marked as secret)

## Step 3: Get Gemini API Key

Go to **[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**

1. Sign in with your Google account
2. Click **"Create API key"** (or copy existing key)
3. Copy the key

## Step 4: Fill in Your `.env.local` File

Open `.env.local` in VS Code and fill in these four values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abc123def456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...paste-your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...paste-your-service-role-key...
GEMINI_API_KEY=AIza...paste-your-gemini-key...
```

### How to Fill It (Step by Step):

1. Open `.env.local` in VS Code
2. Find this line:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   ```
3. Replace `https://your-project-ref.supabase.co` with your actual Project URL from Supabase
4. Find this line:
   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key-here
   ```
5. Replace `your-public-anon-key-here` with your actual anon key
6. Continue for the other two keys
7. **Save the file** (Ctrl+S)

⚠️ **DO NOT commit `.env.local` to GitHub** - it's already in `.gitignore`

## Step 5: Apply Database Schema

1. Go to your Supabase Dashboard: **[https://app.supabase.com](https://app.supabase.com)**
2. Select your Critiq project
3. Go to **SQL Editor**
4. Click **"New query"**
5. Open this file: `supabase/migrations/001_initial_schema.sql` (in VS Code)
6. Copy **entire file content**
7. Paste into the Supabase SQL Editor
8. Click **"Run"** (green button)
9. You should see success messages

✅ Tables created:
- `profiles` - User profiles
- `analyses` - Design analyses
- Storage bucket `designs` - Image storage

## Step 6: Verify Everything Works

### Test 1: Environment Variables
```bash
# In VS Code Terminal, run:
node scripts/verify-supabase-setup.js
```

Should show: **✓ All checks passed**

### Test 2: Sign Up
1. Open **http://localhost:3000** in browser
2. Click **"Get started"**
3. Enter email and password
4. Click **"Sign up"**
5. Check your email for verification link
6. Click the link

✅ If successful:
- You can log in
- You see the dashboard
- Profile created in Supabase database

### Test 3: Upload & Analyze
1. Click **"Upload"**
2. Select a screenshot (PNG, JPG, or WEBP)
3. Click **"Upload"**
4. Paste the returned image URL
5. Select design type
6. Click **"Analyze"**

✅ If successful:
- You see analysis scores (0-100)
- You see recommendations
- Analysis saved to database

## Your Supabase Dashboard Link

Once you create your project, access it at:

**[https://app.supabase.com/projects](https://app.supabase.com/projects)**

Then click on your **Critiq** project.

### Key Dashboard Sections:

| Section | Purpose | Access |
|---------|---------|--------|
| **SQL Editor** | Run SQL queries | Left sidebar → SQL Editor |
| **Database** | View tables & data | Left sidebar → Database |
| **Storage** | View uploaded files | Left sidebar → Storage |
| **Authentication** | Manage users | Left sidebar → Authentication |
| **Settings** | Get API keys | Top right → Settings → API |

## Troubleshooting

### Error: "Unauthorized" or "Database error"

**Problem**: Environment variables not filled in
**Solution**: 
1. Check `.env.local` has real values (not placeholders)
2. Check no extra spaces around `=`
3. Save file (Ctrl+S)
4. Restart dev server (Stop with Ctrl+C, run `npm run dev` again)

### Error: "Cannot create tables"

**Problem**: SQL query failed
**Solution**:
1. Make sure you copied the **entire** SQL file
2. Check for SQL syntax errors in the Supabase Editor
3. Make sure you're in the right project
4. Try running it again

### Error: "File upload failed"

**Problem**: Storage bucket not created
**Solution**:
1. Check database tables were created successfully
2. Go to Supabase Dashboard → Storage
3. Check `designs` bucket exists
4. If missing, run the full SQL migration again

### Error: "Analysis returned error"

**Problem**: Gemini API key issue
**Solution**:
1. Check `GEMINI_API_KEY` is filled in `.env.local`
2. Get new key from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
3. Restart dev server after updating

## Quick Reference

### Dev Server
- **URL**: http://localhost:3000
- **Start**: `npm run dev`
- **Stop**: Ctrl+C

### Supabase
- **Dashboard**: https://app.supabase.com
- **API Settings**: Settings → API
- **SQL Editor**: Left sidebar → SQL Editor

### Environment File
- **Location**: `.env.local` (root of project)
- **Don't commit**: It's in `.gitignore` ✓
- **Restart needed**: After editing, restart dev server

### Need Help?
- See `SUPABASE_SETUP.md` for complete setup guide
- See `SUPABASE_QUICKSTART.md` for 5-minute setup
- See `ARCHITECTURE.md` for how the app works

---

**Status**: ✅ Dev server running  
**Next**: Fill in credentials and apply database schema  
**Time to complete**: 10-15 minutes

Let me know once you've set up your Supabase project and I can help with any issues! 🚀
