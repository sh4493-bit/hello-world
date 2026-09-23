import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

export type ColorRecord = {
  id: number;
  name: string;
  hex: string | null;
  family: string | null;
  created_at?: string;
};

export async function getColorRecords(): Promise<ColorRecord[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("genai")
    .select("id, name, hex, family, created_at")
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return [];
  }

  return (data ?? []) as ColorRecord[];
}