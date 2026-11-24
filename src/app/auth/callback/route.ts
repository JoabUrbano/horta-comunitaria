import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino do link de confirmação de e-mail.
 * O Supabase manda de volta com ?code=..., que trocamos por uma sessão (já fica logado).
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/", request.url));
    console.error("[auth:callback] falha ao trocar o código:", error.code, error.message);
  }

  // link vencido, já usado, ou aberto em outro navegador/celular
  return NextResponse.redirect(new URL("/login?aviso=link", request.url));
}
