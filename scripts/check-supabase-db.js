#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local');
  process.exit(1);
}
const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).filter(Boolean).reduce((acc, line) => {
  if (!line || line.startsWith('#')) return acc;
  const idx = line.indexOf('=');
  if (idx === -1) return acc;
  acc[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  return acc;
}, {});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
  process.exit(1);
}

const admin = createClient(url, key);

(async () => {
  try {
    const { data, error } = await admin
      .from('analyses')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Query error:', error);
      process.exit(1);
    }

    console.log('Analyses table accessible, row sample:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err.message || err);
    process.exit(1);
  }
})();
