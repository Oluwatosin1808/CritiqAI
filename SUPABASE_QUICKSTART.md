# Supabase Quick Start Guide

Get Supabase up and running for Critiq in 5 minutes! ⚡

## Prerequisites

- Supabase account: https://supabase.com
- Google Gemini API key: https://aistudio.google.com/app/apikey
- Project already open in VS Code

## Quick Setup (5 Minutes)

### Step 1: Create Supabase Project (2 min)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New project"**
3. Fill in:
   - Name: `Critiq` (or any name)
   - Password: Create a strong password
   - Region: Choose your region
4. Click **"Create new project"** and wait for completion

### Step 2: Get API Keys (1 min)

1. After project creation, go to **Settings → API**
2. Copy these three values:
   - `Project URL` (under "URL")
   - `anon public` key (under "Your API keys")
   - `service_role secret` key

### Step 3: Configure Environment (1 min)

1. In terminal, copy the env template:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. Save the file

### Step 4: Apply Database Schema (1 min)

**Option A: Dashboard (Recommended)**

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open `supabase/migrations/001_initial_schema.sql`
4. Copy entire file content
5. Paste into SQL editor
6. Click **"Run"**

**Option B: Supabase CLI**

```bash
# Install CLI (if not already installed)
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Step 5: Verify Setup (Quick check)

```bash
node scripts/verify-supabase-setup.js
```

You should see: ✓ All checks passed!

## You're Done! 🎉

Start the development server:

```bash
npm run dev
```

Visit http://localhost:3000 and:

1. **Sign up** with an email
2. **Upload** a design screenshot
3. **Analyze** the design
4. **View** your analyses

## Detailed Setup Guide

For more detailed instructions, see: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## Key Files

- **Migrations**: `supabase/migrations/001_initial_schema.sql`
- **Config**: `supabase/config.toml`
- **Environment**: `.env.local` (create from `.env.example`)
- **Supabase Clients**: `src/lib/supabase/`
- **Services**: `src/lib/services/`

## Troubleshooting

### "Environment variables not found"

```bash
# Check .env.local exists
ls -la .env.local

# Should show the file, if not:
cp .env.example .env.local
```

### "Cannot connect to Supabase"

1. Check `NEXT_PUBLIC_SUPABASE_URL` is correct in `.env.local`
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Verify project exists in Supabase Dashboard
4. Try `npm run dev` again

### "Database tables don't exist"

1. Go to Supabase Dashboard
2. Check **Database → Tables**
3. If tables missing, run migration:
   - Go to **SQL Editor**
   - Copy & paste contents of `supabase/migrations/001_initial_schema.sql`
   - Click **Run**

### "Upload fails"

1. Check `designs` bucket exists in **Storage**
2. Verify you're authenticated (signed in)
3. Check file is PNG, JPG, or WEBP format
4. Check file is under 10MB

### "Analysis returns error"

1. Check `GEMINI_API_KEY` is set in `.env.local`
2. Check API key is from: https://aistudio.google.com/app/apikey
3. Verify image URL is publicly accessible
4. Check Gemini API quota hasn't been exceeded

## Testing the Integration

### Test 1: Authentication

```bash
# Start the app
npm run dev

# Visit http://localhost:3000/signup
# Sign up with test email
# Should see dashboard
```

### Test 2: File Upload

```bash
# On dashboard, click "Upload"
# Select a screenshot file (PNG, JPG, or WEBP)
# Click "Upload"
# Should see public URL returned
```

### Test 3: Design Analysis

```bash
# Paste the image URL from test 2
# Select design type (e.g., "Landing Page")
# Click "Analyze"
# Should see analysis results with scores and feedback
```

### Test 4: View Analyses

```bash
# Click "View All" or "My Analyses"
# Should see all your past analyses
# Each should show scores and feedback
```

## What Just Happened?

Supabase provides:

✅ **Database** - Stores your users and analyses
✅ **Authentication** - Email/password signup & login
✅ **Storage** - Stores uploaded design images
✅ **Security** - Row-level security policies
✅ **APIs** - RESTful access to all data

Your Critiq app uses:

✅ **Gemini API** - Analyzes designs with AI
✅ **Supabase Database** - Stores results
✅ **Supabase Storage** - Stores images
✅ **Supabase Auth** - Manages users

## Next Steps

1. **Customize** - Update your profile info
2. **Upload** - Add design screenshots
3. **Analyze** - Get AI-powered feedback
4. **Share** - (Coming soon) Share analyses with team

## Production Deployment

When ready to deploy:

1. **Set environment variables** in your hosting platform
2. **Configure CORS** in Supabase
3. **Enable backups** in Supabase
4. **Review RLS policies** for security
5. **Monitor usage** in Supabase Dashboard

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for production checklist.

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Architecture Guide**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Developer Guide**: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Full Setup Guide**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

---

**Estimated time to completion**: 5-10 minutes ⏱️

Happy analyzing! 🚀
