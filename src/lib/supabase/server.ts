import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente do Supabase para Server Components, Server Actions e Route Handlers.
 * Crie um novo a cada requisição: ele lê a sessão do usuário nos cookies.
 *
 * Como lê cookies, quem usar este cliente precisa estar dentro de um <Suspense>
 * (regra do Cache Components do Next 16).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado de um Server Component, onde não dá para gravar cookie.
            // Pode ignorar: a sessão é renovada no próximo Server Action / Route Handler.
          }
        },
      },
    },
  );
}

export function supabaseConfigurado() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
