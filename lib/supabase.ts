import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!anonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');

/**
 * Shared Supabase client for read-only public data
 * (neighborhoods, reviews, etc).
 *
 * Web app has no user auth for now — when we add the
 * claim flow, we'll split this into server/browser
 * clients with cookie handling via @supabase/ssr.
 */
export const supabase = createClient(url, anonKey);