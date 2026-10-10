import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

export const isSupabaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);

function createNotConfiguredStub() {
  const fail = () => {
    throw new Error("Supabase belum dikonfigurasi: isi SUPABASE_URL dan SUPABASE_KEY di .env / Vercel Environment Variables.");
  };
  return { from: fail };
}

if (!isSupabaseConfigured) {
  console.warn("SUPABASE_URL / SUPABASE_KEY belum diisi. Isi file .env sebelum menjalankan query.");
}

export const supabase = isSupabaseConfigured
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  : createNotConfiguredStub();
