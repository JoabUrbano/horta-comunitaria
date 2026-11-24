import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// telas que não fazem sentido para quem já está logado
const SO_PARA_VISITANTE = ["/login", "/registro"];

/**
 * Roda antes de cada página: renova a sessão do Supabase (o token vence a cada
 * hora) e grava os cookies novos na resposta.
 * Não é aqui que se protege dado: quem protege é o RLS do banco.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !chave) return response;

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesParaGravar, cabecalhos) {
        cookiesParaGravar.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesParaGravar.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(cabecalhos).forEach(([nome, valor]) => response.headers.set(nome, valor));
      },
    },
  });

  // Não coloque código entre createServerClient e getClaims: é o getClaims que renova a sessão.
  const { data } = await supabase.auth.getClaims();

  if (data?.claims && SO_PARA_VISITANTE.includes(request.nextUrl.pathname)) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/";
    destino.search = "";
    const redirecionar = NextResponse.redirect(destino);
    response.cookies.getAll().forEach((cookie) => redirecionar.cookies.set(cookie));
    return redirecionar;
  }

  return response;
}

export const config = {
  // tudo, menos arquivos estáticos e imagens
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
