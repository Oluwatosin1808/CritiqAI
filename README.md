# Critiq

AI-powered UI design reviews. Upload screenshots, get structured feedback from a panel of AI design experts.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (Auth, Postgres, Storage)
- **Google Gemini 2.5 Flash** (multimodal analysis)

## Quick Start

### 1. Clone and install

```bash
cd Critiq
npm install
cp .env.example .env.local
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

3. Run the database migration in **SQL Editor**:
   - Open `supabase/migrations/001_initial_schema.sql`
   - Paste and execute the full script

   This creates:
   - `profiles` and `analyses` tables with RLS
   - `designs` storage bucket with policies
   - Auto-profile trigger on signup

4. Enable **Email** auth provider in **Authentication → Providers**

5. (Optional) Disable email confirmation for local dev:
   - **Authentication → Providers → Email** → turn off "Confirm email"

### 3. Gemini API setup

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Add to `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, for storage uploads) |
| `GEMINI_API_KEY` | Google Gemini API key |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/      # POST — upload image to Supabase Storage
│   │   ├── analyze/     # POST — Gemini analysis + save to DB
│   │   └── analyses/    # GET — fetch user's analysis history
│   ├── dashboard/       # Analysis history + score cards
│   ├── upload/          # Drag-and-drop upload page
│   ├── analysis/[id]/   # Full roast results
│   ├── login/           # Auth login
│   └── signup/          # Auth signup
├── components/          # UI components (shadcn + custom)
├── lib/supabase/        # Supabase clients (browser, server, admin)
├── services/gemini.ts   # Gemini multimodal analysis
└── types/               # TypeScript types
```

## API Routes

### `POST /api/upload`
Uploads an image to the `designs` storage bucket. Requires auth.

**Request:** `multipart/form-data` with `file` field  
**Response:** `{ imageUrl: string }`

### `POST /api/analyze`
Sends image to Gemini and saves analysis. Requires auth.

**Request:** `{ imageUrl: string, designType?: string }`  
**Response:** `{ id: string, analysis: AnalysisResult }`

### `GET /api/analyses`
Returns all analyses for the authenticated user.

**Response:** `{ analyses: Analysis[] }`

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

Update Supabase **Authentication → URL Configuration** with your production URL.

## License

MIT
