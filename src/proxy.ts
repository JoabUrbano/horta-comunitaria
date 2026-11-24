import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// telas que não fazem sentido para quem já está logado
const SO_PARA_VISITANTE = ["/login", "/registro"];
// abertas para quem não está logado (o resto exige login)
const PUBLICAS = [...SO_PARA_VISITANTE, "/auth/callback"];

/**
 * Roda antes de cada página:
 *  1. renova a sessão do Supabase (o token vence a cada hora) e grava os cookies novos;
 *  2. quem não está logado vai para /login; quem está logado e abre /login ou /registro vai para o início.
 * Isso cuida da navegação. Quem protege os DADOS é o RLS do banco.
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

  const caminho = request.nextUrl.pathname;
  const logado = Boolean(data?.claims);

  if (!logado && !PUBLICAS.includes(caminho)) return redirecionarPara("/login", request, response);
  if (logado && SO_PARA_VISITANTE.includes(caminho)) return redirecionarPara("/", request, response);

  return response;
}

/** Redireciona levando junto os cookies de sessão que o Supabase acabou de renovar. */
function redirecionarPara(caminho: string, request: NextRequest, response: NextResponse) {
  const destino = request.nextUrl.clone();
  destino.pathname = caminho;
  destino.search = "";
  const redirecionar = NextResponse.redirect(destino);
  response.cookies.getAll().forEach((cookie) => redirecionar.cookies.set(cookie));
  return redirecionar;
}

export const config = {
  // tudo, menos arquivos estáticos e imagens
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
