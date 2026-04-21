import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _admin: SupabaseClient | null = null;

export function hasSupabaseAdmin() {
  return Boolean(url && serviceRoleKey);
}

export function supabaseAdmin(): SupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin env is not configured");
  }
  if (!_admin) {
    _admin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _admin;
}

export function hasSupabasePublic() {
  return Boolean(url && anonKey);
}
