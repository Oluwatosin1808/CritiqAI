# Supabase Setup Guide for Critiq

## Prerequisites

1. **Supabase Account**: Sign up at [https://supabase.com](https://supabase.com)
2. **Node.js & npm**: Already installed (required for Supabase CLI)
3. **Supabase CLI**: Install with `npm install -g supabase`

## Step 1: Create a Supabase Project

### Via Web Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New project"
3. Enter project details:
   - **Name**: `Critiq` (or your preference)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
4. Click "Create new project"
5. Wait for project to be initialized (~2 minutes)

### Get Project Credentials

After project creation, you'll need:
- **Project URL**: `https://[project-ref].supabase.co`
- **Anon Key**: Public key for client-side operations
- **Service Role Key**: Secret key for admin operations

Navigate to: **Settings → API** to find these keys.

## Step 2: Set Up Environment Variables

### Create `.env.local`

In the project root, create or update `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Gemini API
GEMINI_API_KEY=your-gemini-api-key-here
```

⚠️ **NEVER commit `.env.local` to version control!** It contains secret keys.

### Create `.env.example`

For documentation, create `.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key

# Gemini API
GEMINI_API_KEY=your-gemini-api-key
```

## Step 3: Apply Database Schema

### Option A: Using Supabase Dashboard (Recommended for First Time)

1. Go to Supabase Dashboard → **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run"
6. Verify the output shows success

### Option B: Using Supabase CLI

```bash
# Login to Supabase
npx supabase login

# Link project
npx supabase link --project-ref jjkbkspksvsbcbxupzyw

# Push migrations
npx supabase db push --linked --yes

# Verify
npx supabase db pull --schema public
```

## Step 4: Verify Database Tables

In Supabase Dashboard, navigate to **Database → Tables** and verify:

- ✅ **profiles** table
  - Columns: `id`, `full_name`, `created_at`
  - RLS enabled with policies
  
- ✅ **analyses** table
  - Columns: `id`, `user_id`, `image_url`, `design_type`, `analysis`, `created_at`
  - Indexes on `user_id` and `created_at`
  - RLS enabled with policies

## Step 5: Configure Authentication

### Email/Password Authentication (Default)

This is already enabled by default in Supabase. Verify:

1. Go to **Authentication → Settings**
2. Check **Email** provider is enabled
3. Disable unnecessary providers (Google, GitHub, etc.) if not needed
4. Configure email templates if desired

### Email Templates (Optional)

Customize email templates in **Authentication → Email Templates**:
- Confirm signup email
- Password reset email
- Email change email

Default templates are fine for MVP.

## Step 6: Set Up Storage Bucket

The migration creates the `designs` storage bucket automatically. Verify:

1. Go to **Storage → Buckets**
2. Look for bucket named `designs`
3. Verify it's public (as required for returning public URLs)

**Bucket Policies** (already created by migration):
- ✅ Authenticated users can upload to `user_id/` folder
- ✅ Anyone can view designs
- ✅ Users can update their own designs

## Step 7: Test Connection

### Quick Connection Test

```bash
npm run dev
```

Visit http://localhost:3000 and:
1. Sign up with an email
2. Verify profile created in database
3. Upload a design image
4. Verify file in Storage bucket
5. Run analysis on design
6. Verify analysis saved in database

### Automated Test

Create a test file `test-supabase.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

async function testConnection() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Test 1: Auth
    const { data: { user } } = await client.auth.getUser();
    console.log("✓ Auth working:", user?.email);

    // Test 2: Database
    if (user) {
      const { data: profile } = await client
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();
      console.log("✓ Database working:", profile);
    }

    // Test 3: Storage
    const { data: buckets } = await client.storage.listBuckets();
    console.log("✓ Storage working, buckets:", buckets?.map(b => b.name));
  } catch (error) {
    console.error("✗ Connection test failed:", error);
  }
}

testConnection();
```

## Step 8: Configure Row Level Security (RLS) Policies

All RLS policies are created by the migration. Verify they're active:

1. Go to **Database → Policies**
2. Filter by table (profiles / analyses)
3. Verify these policies exist:

### Profiles Policies
- ✅ Users can view own profile
- ✅ Users can insert own profile
- ✅ Users can update own profile

### Analyses Policies
- ✅ Users can view own analyses
- ✅ Users can insert own analyses
- ✅ Users can delete own analyses

### Storage Policies
- ✅ Authenticated users can upload designs
- ✅ Anyone can view designs
- ✅ Users can update own designs

## Step 9: Database Backups

### Automatic Backups

Supabase automatically creates backups:
1. Go to **Settings → Backups**
2. Backups are retained per your plan
3. Point-in-time recovery available (Pro plan)

### Manual Backup

For extra safety:

```bash
# Backup using Supabase CLI
supabase db dump --local
```

## Step 10: Monitor Usage & Logs

### Monitor Real-Time Logs

In Dashboard:
1. **Database → Logs** - SQL query logs
2. **Storage → Usage** - Storage space used
3. **Authentication → Users** - Track signups

### API Rate Limits

Check **Settings → API** for:
- Request limits (varies by plan)
- Current usage
- Available quota

## Step 11: Enable Monitoring (Optional)

### Set Up Alerts

1. Go to **Settings → Monitoring**
2. Enable database monitoring
3. Set up email alerts for:
   - High query latency
   - Disk space issues
   - Auth problems

## Production Deployment Checklist

Before deploying to production:

- [ ] Enable strong database password
- [ ] Rotate all API keys regularly
- [ ] Configure CORS settings
- [ ] Enable API gateway authentication
- [ ] Set up database backups
- [ ] Enable monitoring and alerts
- [ ] Review RLS policies are correct
- [ ] Test with production data volume
- [ ] Configure custom domain (Pro plan)
- [ ] Enable database encryption (Pro plan)

## Troubleshooting

### "Project not found" Error

**Problem**: Cannot connect to Supabase project

**Solution**:
1. Verify project URL is correct in `.env.local`
2. Check API keys are from correct project
3. Ensure project is not paused (check dashboard)

### "Unauthorized" on API Calls

**Problem**: Getting 401 errors on authenticated requests

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
2. Check user is properly authenticated
3. Verify RLS policies allow the operation

### "Failed to upload file" Error

**Problem**: File upload fails to storage bucket

**Solution**:
1. Check `designs` bucket exists in Storage
2. Verify storage policies are created
3. Ensure file path starts with `{user_id}/`
4. Check file size is under bucket limit

### "Connection timeout"

**Problem**: Requests hang or timeout

**Solution**:
1. Check internet connection
2. Verify Supabase project is running (not paused)
3. Check status page: https://status.supabase.com
4. Try different region endpoint if available

### RLS Policy Not Working

**Problem**: Policy allows unauthorized access

**Solution**:
1. Verify policy condition in SQL editor
2. Check policy is enabled (toggle switch)
3. Run test query in SQL editor manually
4. Check auth.uid() is returning correct value

## Database Optimization

### Add Indexes (Already Done)

Indexes are created for:
- `analyses(user_id)` - Fast user lookups
- `analyses(created_at desc)` - Fast sorting

### Monitor Query Performance

1. **Query Performance**: Database → Logs
2. **Slow queries**: Check logs for queries > 100ms
3. **Optimize**: Add indexes if needed

## Scaling Considerations

### As User Base Grows

1. **Database**: Upgrade plan for more connections
2. **Storage**: Monitor disk space usage
3. **API**: Monitor request rates and latencies
4. **Realtime**: Enable realtime features if needed (Supabase → Realtime)

### Database Size Limits

- Free: 500 MB
- Pro: 8 GB
- Team: 50 GB+

Current Critiq tables are minimal, but monitor as data grows.

## Security Best Practices

### 1. API Keys
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safe to expose (client-side operations only)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Keep secret (server-side only)
- ✅ Rotate keys periodically in production

### 2. RLS Policies
- ✅ Always use auth.uid() to prevent data leaks
- ✅ Test policies with different users
- ✅ Default deny, then explicitly allow

### 3. Storage
- ✅ User can only upload to their folder (`{user_id}/`)
- ✅ Public read for images (needed for Gemini API)
- ✅ Only authenticated users can upload

## API Endpoints Reference

### Supabase Base URLs

```typescript
// Client-side (anon key)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Server-side (service role key)
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

### Example API Calls (using JavaScript SDK)

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123"
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123"
});

// Fetch analyses
const { data, error } = await supabase
  .from("analyses")
  .select("*")
  .eq("user_id", user.id);

// Upload file
const { data, error } = await supabase.storage
  .from("designs")
  .upload(`${user.id}/design.png`, file);
```

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Authentication Guide**: https://supabase.com/docs/guides/auth
- **Storage Guide**: https://supabase.com/docs/guides/storage
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

## Next Steps

1. ✅ Create Supabase project
2. ✅ Set up environment variables
3. ✅ Apply database schema
4. ✅ Configure authentication
5. ✅ Set up storage bucket
6. ✅ Test connection
7. **→ Start development!**

Run `npm run dev` and begin using the app with Supabase backend.
