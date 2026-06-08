# 🚀 Supabase Database Setup for Your Project

Your Supabase Project: **jjkbkspksvsbcbxupzyw**

## Step-by-Step Setup

### Step 1: Get Your Credentials from Supabase Dashboard

1. Go to your project: https://supabase.com/dashboard/project/jjkbkspksvsbcbxupzyw
2. Click **Settings** (⚙️ icon on the left sidebar)
3. Click **API** tab
4. You'll see this page with your credentials:

```
┌────────────────────────────────────┐
│ URL                                │
│ https://jjkbkspksvsbcbxupzyw...   │
│ (Copy this)                        │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ anon public                        │
│ eyJhbGciOiJIUzI1NiIs...            │
│ (Copy this)                        │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ service_role secret                │
│ eyJhbGciOiJIUzI1NiIs...            │
│ (Copy this - KEEP SECRET!)         │
└────────────────────────────────────┘
```

**Copy these three values exactly as shown.**

---

### Step 2: Update Your `.env.local` File

1. Open `.env.local` in VS Code (should be at the root of your project)
2. Find these lines:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key-here
   ```

3. Replace them with YOUR actual values from Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://jjkbkspksvsbcbxupzyw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-pasted-here
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-pasted-here
   ```

4. **Save the file** (Ctrl+S)

⚠️ **Important**: Don't commit `.env.local` - it's in `.gitignore` for security.

---

### Step 3: Apply Database Schema

This creates all the tables your app needs.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project: https://supabase.com/dashboard/project/jjkbkspksvsbcbxupzyw
2. Click **SQL Editor** (left sidebar, under "Development")
3. Click **"New query"** (or paste directly)
4. **In VS Code**, open file: `supabase/migrations/001_initial_schema.sql`
5. **Select all** (Ctrl+A) and **Copy** (Ctrl+C)
6. **Paste** into the Supabase SQL Editor
7. Click the **"Run"** button (green arrow, bottom right)
8. Wait for it to complete (should see green checkmarks)

**Option B: Using Supabase CLI**

```bash
# In terminal, run:
supabase login
supabase link --project-ref jjkbkspksvsbcbxupzyw
supabase db push
```

---

### Step 4: Verify Tables Were Created

1. In Supabase Dashboard, click **Database** (left sidebar)
2. Expand the **Tables** section
3. You should see:
   - ✅ `profiles`
   - ✅ `analyses`

If you see these tables, your database is set up correctly!

---

### Step 5: Get Gemini API Key

Your Gemini API key is still needed for design analysis:

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API key"** (if needed) or copy an existing key
4. Copy the key

Update `.env.local`:
```env
GEMINI_API_KEY=AIza...your-actual-gemini-key...
```

Save the file (Ctrl+S)

---

### Step 6: Restart Your Dev Server

Your dev server might still be running. Restart it:

1. In terminal where `npm run dev` is running, press **Ctrl+C** to stop
2. Run again:
   ```bash
   npm run dev
   ```
3. You should see:
   ```
   ✓ Next.js 15.5.19 (Turbopack)
   - Local: http://localhost:3000
   ✓ Ready in X.Xs
   ```

---

### Step 7: Test Everything Works

**Test 1: Sign Up**
1. Open http://localhost:3000 in your browser
2. Click **"Get started"**
3. Enter email and password
4. Click **"Sign up"**
5. Check your email for verification link
6. Click the link to verify

✅ If successful: You're logged in and can see the dashboard

**Test 2: Upload & Analyze**
1. Click **"Upload design"**
2. Select a screenshot (PNG, JPG, WEBP)
3. Click **"Upload"**
4. Copy the returned URL
5. Go back and paste URL in the analyze form
6. Select design type
7. Click **"Analyze"**

✅ If successful: You see analysis scores and feedback

**Test 3: Verify Database**
1. In Supabase Dashboard, go to **Database → Tables → analyses**
2. You should see your analysis record

---

## ✅ Complete Setup Checklist

- [ ] Got Project URL from Supabase Settings → API
- [ ] Got anon public key from Supabase Settings → API
- [ ] Got service_role secret from Supabase Settings → API
- [ ] Updated `.env.local` with Supabase credentials
- [ ] Updated `.env.local` with Gemini API key
- [ ] Ran SQL migration in Supabase SQL Editor
- [ ] Verified tables exist in Supabase Database
- [ ] Restarted dev server (`npm run dev`)
- [ ] Tested sign up at http://localhost:3000
- [ ] Tested upload & analyze
- [ ] Verified record in database

---

## 🔗 Important Links

| Action | Link |
|--------|------|
| **Your Supabase Project** | https://supabase.com/dashboard/project/jjkbkspksvsbcbxupzyw |
| **API Settings** | https://supabase.com/dashboard/project/jjkbkspksvsbcbxupzyw/settings/api |
| **Database Tables** | https://supabase.com/dashboard/project/jjkbkspksvsbcbxupzyw/database/tables |
| **SQL Editor** | https://supabase.com/dashboard/project/jjkbkspksvsbcbxupzyw/sql/new |
| **Your App** | http://localhost:3000 |

---

## Troubleshooting

### "Cannot connect to Supabase"
**Problem**: Getting 401 or connection errors
**Solution**:
1. Check `.env.local` has EXACT values from Supabase (no extra spaces)
2. Make sure URL starts with `https://`
3. Restart dev server after updating `.env.local`

### "Table doesn't exist" error
**Problem**: Tables not created in database
**Solution**:
1. Go to Supabase SQL Editor
2. Copy entire content from `supabase/migrations/001_initial_schema.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Check for errors in the output

### "Authorization error" on sign up
**Problem**: Auth not working
**Solution**:
1. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
2. Go to Supabase → Authentication → Settings
3. Make sure Email provider is enabled
4. Check email confirmation is configured

### "Upload fails"
**Problem**: Can't upload files
**Solution**:
1. Check `designs` bucket exists in Storage
2. Run full SQL migration (includes storage setup)
3. Check file is PNG, JPG, or WEBP
4. Check file is under 10MB

### "Analysis returns error"
**Problem**: Design analysis fails
**Solution**:
1. Check `GEMINI_API_KEY` is filled in `.env.local`
2. Get fresh key from https://aistudio.google.com/app/apikey
3. Restart dev server after updating
4. Try with a different image

---

## Need More Help?

- **Complete Setup Guide**: See `SUPABASE_SETUP.md`
- **Architecture Guide**: See `ARCHITECTURE.md`
- **Developer Guide**: See `DEVELOPER_GUIDE.md`

---

**Your Supabase Project ID**: `jjkbkspksvsbcbxupzyw`

Once you've completed these steps, your app will be fully functional! 🎉
