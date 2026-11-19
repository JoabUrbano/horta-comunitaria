import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente do Supabase para Client Components ("use client").
 * Usa a chave pública: o que cada um pode ver é decidido pelo RLS no banco.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
