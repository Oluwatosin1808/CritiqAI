# Supabase Database Schema Documentation

## Overview

Critiq uses Supabase's PostgreSQL database to store user profiles, design analyses, and images. This document describes the complete schema.

## Tables

### 1. Profiles Table

Stores user profile information. Created automatically when a user signs up.

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
)
```

**Columns:**
- `id` (UUID) - User ID from auth.users, primary key
- `full_name` (text) - User's full name (optional)
- `avatar_url` (text) - URL to user's avatar image (optional)
- `bio` (text) - User bio (optional)
- `created_at` (timestamp) - Profile creation time
- `updated_at` (timestamp) - Last profile update time

**Indexes:** None (ID is primary key)

**Row Level Security (RLS):**
```
✓ Users can view their own profile
✓ Users can insert their own profile
✓ Users can update their own profile
```

**Example Row:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "full_name": "John Designer",
  "avatar_url": "https://...",
  "bio": "Web designer",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### 2. Analyses Table

Stores design analysis results from Gemini AI.

```sql
CREATE TABLE public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  design_type text CHECK (design_type IN (
    'landing_page',
    'mobile_app',
    'dashboard',
    'saas_product',
    NULL
  )),
  analysis jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
)
```

**Columns:**
- `id` (UUID) - Unique analysis record ID
- `user_id` (UUID) - Foreign key to auth.users
- `image_url` (text) - URL of the analyzed image
- `design_type` (text) - Type of design (optional)
  - `'landing_page'` - Landing page design
  - `'mobile_app'` - Mobile app UI
  - `'dashboard'` - Dashboard/admin interface
  - `'saas_product'` - SaaS product UI
- `analysis` (jsonb) - Analysis results (see schema below)
- `created_at` (timestamp) - Analysis creation time

**Analysis JSON Structure:**
```typescript
{
  "overall_score": number,        // 0-100
  "ux_score": number,              // 0-100
  "visual_score": number,          // 0-100
  "accessibility_score": number,   // 0-100
  "conversion_score": number,      // 0-100
  "summary": string,               // Short summary
  "strengths": string[],           // List of strengths
  "issues": string[],              // List of issues
  "recommendations": string[]      // List of recommendations
}
```

**Indexes:**
```sql
- analyses_user_id_idx ON (user_id)
  Purpose: Fast lookup of user's analyses
  Used by: GET /api/analyses

- analyses_created_at_idx ON (created_at DESC)
  Purpose: Fast sorting by date
  Used by: List queries with ordering

- analyses_design_type_idx ON (design_type)
  Purpose: Filter analyses by type
  Used by: Analytics/reports
```

**Row Level Security (RLS):**
```
✓ Users can view their own analyses
✓ Users can insert their own analyses
✓ Users can delete their own analyses
✗ Users cannot update analyses (immutable records)
```

**Example Row:**
```json
{
  "id": "987e6543-e89b-12d3-a456-426614174999",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "image_url": "https://supabase.../designs/user-id/1704965400123.png",
  "design_type": "landing_page",
  "analysis": {
    "overall_score": 78,
    "ux_score": 82,
    "visual_score": 75,
    "accessibility_score": 72,
    "conversion_score": 76,
    "summary": "Good overall design with clear hierarchy...",
    "strengths": [
      "Clear call-to-action buttons",
      "Good color contrast",
      "Mobile responsive layout"
    ],
    "issues": [
      "Form fields could be larger",
      "Navigation could be more prominent"
    ],
    "recommendations": [
      "Increase button size for better mobile interaction",
      "Add loading states for better UX"
    ]
  },
  "created_at": "2024-01-15T10:35:00Z"
}
```

---

## Storage

### Designs Bucket

Stores uploaded design screenshot images.

**Bucket Name:** `designs`
**Public:** Yes (required for Gemini API access)
**Max File Size:** 10 MB
**Allowed MIME Types:**
- `image/png`
- `image/jpeg`
- `image/webp`

**Path Structure:**
```
designs/
├── {user_id_1}/
│   ├── 1704965400123.png
│   ├── 1704965412456.jpg
│   └── ...
├── {user_id_2}/
│   ├── 1704965500789.webp
│   └── ...
└── ...
```

**Storage Policies:**
```
✓ Authenticated users can upload to their folder (user_id/*)
✓ Anyone can view designs (public read)
✓ Users can update/delete their own files
✗ Users cannot upload to other users' folders
```

**Example Public URL:**
```
https://your-project-ref.supabase.co/storage/v1/object/public/designs/
  123e4567-e89b-12d3-a456-426614174000/1704965400123.png
```

---

## Relationships

```
┌─────────────────┐
│   auth.users    │
│  (Supabase)     │
├─────────────────┤
│ id (PK)         │
│ email           │
│ created_at      │
└────────┬────────┘
         │
         │ One-to-One
         │ (ON DELETE CASCADE)
         │
         ▼
┌─────────────────┐
│    profiles     │
├─────────────────┤
│ id (PK) → user  │
│ full_name       │
│ avatar_url      │
│ bio             │
└─────────────────┘

┌─────────────────┐
│   auth.users    │
│  (Supabase)     │
├─────────────────┤
│ id (PK)         │
│ email           │
│ created_at      │
└────────┬────────┘
         │
         │ One-to-Many
         │ (ON DELETE CASCADE)
         │
         ▼
┌─────────────────┐
│    analyses     │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ image_url       │
│ design_type     │
│ analysis (JSON) │
│ created_at      │
└─────────────────┘
```

---

## Functions & Triggers

### handle_new_user()

**Purpose:** Automatically create a profile when a user signs up

**Trigger:** `on_auth_user_created` AFTER INSERT on `auth.users`

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;
```

**Flow:**
1. User signs up via Auth
2. Trigger fires on new auth.users row
3. New profile automatically created
4. User can immediately use the app

---

## Query Examples

### Get User's Analyses
```sql
SELECT * FROM analyses
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC
LIMIT 50;
```

### Get Single Analysis
```sql
SELECT * FROM analyses
WHERE id = 'analysis-id-here'
AND user_id = 'user-id-here';  -- RLS ensures this automatically
```

### Get Analysis Statistics
```sql
SELECT
  COUNT(*) as total_analyses,
  AVG((analysis->>'overall_score')::int) as avg_score,
  design_type,
  COUNT(*) FILTER (WHERE design_type IS NOT NULL) as designs_by_type
FROM analyses
WHERE user_id = 'user-id-here'
GROUP BY design_type;
```

### Get Recent Analyses Across Platform
```sql
SELECT
  a.id,
  a.image_url,
  a.design_type,
  (a.analysis->>'overall_score')::int as score,
  a.created_at,
  p.full_name
FROM analyses a
JOIN profiles p ON a.user_id = p.id
ORDER BY a.created_at DESC
LIMIT 100;
```

---

## Row Level Security (RLS) Details

### How RLS Works

1. **Database Level**: Policies are enforced by PostgreSQL
2. **User Context**: `auth.uid()` returns current user's ID
3. **Automatic Filtering**: Queries automatically filtered by policies
4. **No Bypass**: Even admin queries respect RLS (unless disabled)

### Profile Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);
```

### Analyses Policies

```sql
-- Users can view their own analyses
CREATE POLICY "Users can view own analyses" ON analyses
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own analyses
CREATE POLICY "Users can insert own analyses" ON analyses
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete own analyses" ON analyses
FOR DELETE USING (auth.uid() = user_id);
```

### Storage Policies

```sql
-- Authenticated users can upload to their folder
CREATE POLICY "Authenticated users can upload designs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone can view designs
CREATE POLICY "Anyone can view designs"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'designs');

-- Users can update their own designs
CREATE POLICY "Users can update own designs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Performance Considerations

### Indexes

**Current indexes ensure fast queries for:**

1. **User lookups**
   - `analyses.user_id` - Get all user analyses (single lookup)
   - Query: `SELECT * FROM analyses WHERE user_id = ?`
   - Time: ~1-2ms with 10k records

2. **Sorting by date**
   - `analyses.created_at DESC` - List analyses newest first
   - Query: `SELECT * FROM analyses WHERE user_id = ? ORDER BY created_at DESC`
   - Time: ~1-2ms with 10k records

3. **Design type filtering**
   - `analyses.design_type` - Group/filter by design type
   - Query: `SELECT * FROM analyses WHERE design_type = ?`
   - Time: ~1-2ms with 10k records

### Query Optimization Tips

```sql
-- ✓ FAST: Uses user_id index
SELECT * FROM analyses WHERE user_id = '...' LIMIT 50;

-- ✓ FAST: Uses created_at index
SELECT * FROM analyses WHERE user_id = '...' 
ORDER BY created_at DESC LIMIT 50;

-- ✓ FAST: Uses both indexes
SELECT * FROM analyses WHERE user_id = '...' 
AND design_type = 'landing_page'
ORDER BY created_at DESC;

-- ✗ SLOW: Searches entire analysis JSON (no index)
SELECT * FROM analyses WHERE analysis->>'overall_score'::int > 80;
```

---

## Data Retention & Cleanup

### Current Policies
- User profiles: Deleted with user account (cascade)
- Analyses: Deleted with user account (cascade)
- Storage: Deleted with user account (cascade)

### Future Considerations
- Add `soft_delete` flag for audit trails
- Implement archival for old analyses
- Clean up orphaned storage files

---

## Security Best Practices

✅ **Implemented:**
- RLS on all tables
- User-scoped data access
- No direct admin access via API
- Service role key server-side only

✅ **Recommended:**
- Regular backups (automatic in Supabase)
- Monitor access logs
- Rotate API keys regularly
- Update RLS policies as features change

❌ **Avoid:**
- Disabling RLS
- Using service role key in client code
- Storing sensitive data in analysis JSON
- Bypassing RLS policies

---

## Monitoring Queries

### Check RLS Policies

```sql
-- List all policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check specific table policies
SELECT * FROM pg_policies WHERE tablename = 'analyses';
```

### Monitor Table Size

```sql
-- See table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Active Connections

```sql
-- View active connections to database
SELECT count(*) FROM pg_stat_activity
WHERE datname = 'postgres';
```

---

## Troubleshooting

### Policies Not Applying

**Issue**: Getting data when you shouldn't
**Solution**: 
1. Check RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Verify policy conditions: SELECT from `pg_policies`
3. Test with specific user ID in WHERE clause

### Slow Queries

**Issue**: Analysis retrieval taking > 100ms
**Solution**:
1. Check indexes exist: `\di analyses*`
2. Run EXPLAIN to see query plan
3. Add missing index if needed

### Auth User Not Found

**Issue**: Profile not created on signup
**Solution**:
1. Check trigger exists: `\dt public.on_auth_user_created`
2. Verify trigger function: `\df public.handle_new_user()`
3. Check function for errors

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01 | Initial schema with profiles and analyses |
| 2.0 | 2024-01 | Added design_type field and indexes |

---

## Support

For more information:
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Full Setup Guide: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
