import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase URL and Anon Key must be set in environment variables"
      );
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

export const VEHICLE_IMAGES_BUCKET = "vehicle-images";
