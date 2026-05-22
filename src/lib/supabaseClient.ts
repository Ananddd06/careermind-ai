import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates an authenticated Supabase client using a Clerk JWT token.
 * Requires a custom JWT template named "supabase" in the Clerk dashboard.
 * 
 * @param clerkToken - The token retrieved from `const { getToken } = useAuth(); getToken({ template: 'supabase' })`
 */
export const createClerkSupabaseClient = (clerkToken: string) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
    auth: {
      persistSession: false,
    }
  });
};

/**
 * Fallback unauthenticated client (for public routes or non-user actions)
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
