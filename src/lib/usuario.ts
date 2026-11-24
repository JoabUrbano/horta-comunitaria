import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type UsuarioAtual = { id: string; nome: string; email: string };

/**
 * Usuário logado, com o nome da tabela `pessoa`. Sem sessão, manda para o login.
 * Lê cookies: quem chama precisa estar dentro de um <Suspense>.
 * `cache` faz a consulta rodar uma vez só por visita, mesmo chamada em vários lugares.
 */
export const obterUsuarioAtual = cache(async (): Promise<UsuarioAtual> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/login");

  const email = typeof claims.email === "string" ? claims.email : "";
  // o gatilho do cadastro liga o login à pessoa (pessoa.user_id)
  const { data: pessoa } = await supabase.from("pessoa").select("nome").eq("user_id", claims.sub).maybeSingle();

  return { id: claims.sub, nome: pessoa?.nome ?? (email.split("@")[0] || "Você"), email };
});
