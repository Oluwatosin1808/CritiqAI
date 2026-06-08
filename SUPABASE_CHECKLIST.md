# Supabase Setup Completion Checklist

Complete this checklist to ensure Supabase is properly configured for Critiq.

## Phase 1: Project Creation

- [ ] **Account Created**
  - [ ] Supabase account created at https://supabase.com
  - [ ] Email verified
  - [ ] Billing configured (if not free tier)

- [ ] **Project Created**
  - [ ] Project name: `Critiq` (or your choice)
  - [ ] Region selected (closest to users)
  - [ ] Database password set (strong password)
  - [ ] Project initialized (wait for ~2 min)

## Phase 2: API Keys & Credentials

- [ ] **Keys Retrieved**
  - [ ] Project URL copied (Settings → API → URL)
  - [ ] Anon Key copied (Settings → API → anon public)
  - [ ] Service Role Key copied (Settings → API → service_role secret)
  - [ ] All keys stored securely (password manager or similar)

- [ ] **Environment Variables**
  - [ ] `.env.local` file created (`cp .env.example .env.local`)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` set
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` set
  - [ ] `GEMINI_API_KEY` set
  - [ ] `.env.local` added to `.gitignore` (check if already present)

## Phase 3: Database Schema

- [ ] **Migration Applied**
  - [ ] Migration file read: `supabase/migrations/001_initial_schema.sql`
  - [ ] Schema applied to database (Dashboard or CLI)
  - [ ] No SQL errors during execution

- [ ] **Tables Verified**
  - [ ] `profiles` table exists in Dashboard
    - [ ] Columns present: id, full_name, avatar_url, bio, created_at, updated_at
    - [ ] RLS enabled
  - [ ] `analyses` table exists in Dashboard
    - [ ] Columns present: id, user_id, image_url, design_type, analysis, created_at
    - [ ] Indexes created (user_id, created_at, design_type)
    - [ ] RLS enabled

- [ ] **Policies Verified**
  - [ ] Profile read policy exists
  - [ ] Profile insert policy exists
  - [ ] Profile update policy exists
  - [ ] Analysis read policy exists
  - [ ] Analysis insert policy exists
  - [ ] Analysis delete policy exists
  - [ ] Storage upload policy exists
  - [ ] Storage read policy exists
  - [ ] Storage update policy exists

## Phase 4: Authentication Setup

- [ ] **Auth Configuration**
  - [ ] Auth tab visible in Dashboard
  - [ ] Email provider enabled (Authentication → Settings)
  - [ ] Confirm email verification configured
  - [ ] Password requirements set appropriately
  - [ ] (Optional) Email templates customized

- [ ] **Test Signup**
  - [ ] Able to sign up with test email
  - [ ] Confirmation email received
  - [ ] Account created in Dashboard (Users tab)
  - [ ] Profile created automatically in profiles table

## Phase 5: Storage Setup

- [ ] **Storage Bucket**
  - [ ] `designs` bucket exists (Storage → Buckets)
  - [ ] Bucket is public
  - [ ] File size limit set to 10MB
  - [ ] Allowed MIME types: png, jpeg, webp

- [ ] **Storage Policies**
  - [ ] Upload policy exists
  - [ ] Read policy (public) exists
  - [ ] Update policy exists
  - [ ] Delete policy exists

- [ ] **Test Upload**
  - [ ] Able to upload test image via API
  - [ ] Public URL generated
  - [ ] URL accessible in browser
  - [ ] Image visible in Storage bucket

## Phase 6: Services & Clients

- [ ] **Service Files Present**
  - [ ] `src/lib/services/gemini-service.ts` exists
  - [ ] `src/lib/services/storage-service.ts` exists
  - [ ] `src/lib/services/analysis-repository.ts` exists
  - [ ] `src/lib/services/application-services.ts` exists
  - [ ] `src/lib/services/service-factory.ts` exists

- [ ] **Client Files Present**
  - [ ] `src/lib/supabase/client.ts` exists
  - [ ] `src/lib/supabase/server.ts` exists
  - [ ] `src/lib/supabase/admin.ts` exists

- [ ] **Error Handling**
  - [ ] `src/lib/errors/app-error.ts` exists
  - [ ] Error classes defined
  - [ ] HTTP status mapping implemented

## Phase 7: API Routes

- [ ] **Routes Configured**
  - [ ] `/api/analyze` refactored with new architecture
  - [ ] `/api/upload` refactored with new architecture
  - [ ] `/api/analyses` refactored with new architecture

- [ ] **Validation**
  - [ ] Request validation implemented
  - [ ] Error handling implemented
  - [ ] Logging implemented
  - [ ] Response formatting standardized

## Phase 8: Testing

- [ ] **Verification Script**
  - [ ] Run: `node scripts/verify-supabase-setup.js`
  - [ ] All checks pass (15/15 or similar)
  - [ ] No critical errors reported

- [ ] **Manual Testing**
  - [ ] `npm run dev` starts without errors
  - [ ] Can access http://localhost:3000
  - [ ] Sign up page loads
  - [ ] Can sign up with email

- [ ] **Feature Testing**
  - [ ] Upload works (file stored in Supabase)
  - [ ] Analysis works (Gemini API called)
  - [ ] Results saved to database
  - [ ] Can view analyses list
  - [ ] Can delete analyses

- [ ] **Database Testing**
  - [ ] User created in auth.users
  - [ ] Profile created in profiles table
  - [ ] Analysis created in analyses table
  - [ ] Can view own data only (RLS working)
  - [ ] Cannot view other users' data

- [ ] **Storage Testing**
  - [ ] File uploaded to correct path (user_id/filename)
  - [ ] File accessible via public URL
  - [ ] URL works with Gemini API
  - [ ] Can delete own files

## Phase 9: Configuration Review

- [ ] **Environment Variables**
  - [ ] No secrets in code
  - [ ] All required vars set
  - [ ] `.env.local` in `.gitignore`
  - [ ] `.env.example` has placeholders only

- [ ] **Security**
  - [ ] RLS enabled on all tables
  - [ ] Service role key not in client code
  - [ ] Anon key only has necessary permissions
  - [ ] No direct SQL in frontend code
  - [ ] Input validation on all endpoints

- [ ] **Configuration**
  - [ ] Region set appropriately
  - [ ] Database version compatible
  - [ ] Backup settings configured
  - [ ] Monitoring enabled (optional)

## Phase 10: Documentation

- [ ] **Setup Guides**
  - [ ] SUPABASE_SETUP.md read and understood
  - [ ] SUPABASE_QUICKSTART.md bookmarked
  - [ ] SUPABASE_SCHEMA.md reviewed

- [ ] **Documentation for Team**
  - [ ] Setup guide shared with team (if applicable)
  - [ ] Environment setup instructions clear
  - [ ] Troubleshooting guide available

## Phase 11: Production Preparation (If Applicable)

- [ ] **Backups**
  - [ ] Automatic backups enabled
  - [ ] Backup retention configured
  - [ ] Tested backup restoration process

- [ ] **Monitoring**
  - [ ] Error alerts configured (optional)
  - [ ] Performance monitoring enabled (optional)
  - [ ] Log retention set appropriately

- [ ] **CORS** (If deploying)
  - [ ] Deployment URL added to allowed origins
  - [ ] Tested CORS from production domain

- [ ] **Secrets Management**
  - [ ] API keys stored in secrets manager (Vercel, GitHub, etc.)
  - [ ] Never committed to repository
  - [ ] Rotated regularly in production

## Final Verification

- [ ] **All Checks Complete** ✓
  - [ ] Project created and configured
  - [ ] Database schema applied
  - [ ] Authentication working
  - [ ] Storage configured
  - [ ] Services integrated
  - [ ] Tests passing
  - [ ] Documentation reviewed

- [ ] **Ready for Development** ✓
  - [ ] `npm run dev` works
  - [ ] All features functional
  - [ ] Errors handled gracefully
  - [ ] Performance acceptable

- [ ] **Ready for Deployment** ✓ (if needed)
  - [ ] Environment variables configured
  - [ ] Database backups tested
  - [ ] Monitoring alerts set
  - [ ] Team trained on setup

## Completion Sign-Off

**Setup Completed By:** _______________  
**Date:** _______________  
**Notes:** _______________________________________________

## Troubleshooting Quick Links

| Issue | Solution | Documentation |
|-------|----------|---|
| Environment variables not working | Check `.env.local` syntax and format | [SUPABASE_SETUP.md](SUPABASE_SETUP.md#step-2-set-up-environment-variables) |
| Database tables don't exist | Run migration in SQL Editor | [SUPABASE_SETUP.md](SUPABASE_SETUP.md#step-3-apply-database-schema) |
| Cannot sign up | Check auth settings and email provider | [SUPABASE_SETUP.md](SUPABASE_SETUP.md#step-5-configure-authentication) |
| Upload fails | Check storage bucket and policies | [SUPABASE_SETUP.md](SUPABASE_SETUP.md#troubleshooting) |
| Analysis returns error | Check Gemini API key and quota | [SUPABASE_SETUP.md](SUPABASE_SETUP.md#troubleshooting) |
| RLS policies not working | Verify policy conditions and auth.uid() | [SUPABASE_SCHEMA.md](SUPABASE_SCHEMA.md#row-level-security-rls-details) |

## Next Steps After Completion

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Begin Using the App**
   - Sign up
   - Upload designs
   - Analyze designs
   - Build features

3. **Monitor & Maintain**
   - Watch error logs
   - Monitor database usage
   - Update as needed
   - Keep dependencies current

4. **Scale When Ready**
   - Upgrade Supabase plan if needed
   - Add more features
   - Optimize queries
   - Implement caching

---

**Estimated completion time: 15-30 minutes**

Need help? See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) or [SUPABASE_QUICKSTART.md](SUPABASE_QUICKSTART.md)
