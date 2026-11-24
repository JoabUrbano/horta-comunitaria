import Link from "next/link";
import { Suspense } from "react";
import { sair } from "@/app/auth/actions";
import { createClient, supabaseConfigurado } from "@/lib/supabase/server";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-green-900 dark:text-green-200">
            🌱 Horta Comunitária
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Canteiros, plantas, pragas e pastas da horta.
          </p>
        </div>
        {supabaseConfigurado() && (
          <Suspense fallback={<span className="h-9" />}>
            <MenuUsuario />
          </Suspense>
        )}
      </header>

      {supabaseConfigurado() ? (
        <Suspense fallback={<p className="text-zinc-500">Carregando…</p>}>
          <Resumo />
        </Suspense>
      ) : (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          Supabase ainda não configurado. Copie <code>.env.example</code> para{" "}
          <code>.env.local</code> e preencha a URL e a chave pública do projeto.
        </p>
      )}
    </main>
  );
}

async function Resumo() {
  const supabase = await createClient();

  const [canteiros, especies] = await Promise.all([
    supabase.from("canteiro").select("id, nome, comprimento_m, largura_m").order("nome"),
    supabase.from("especie").select("id, nome_popular, nome_cientifico").order("nome_popular"),
  ]);

  const erro = canteiros.error ?? especies.error;
  if (erro) {
    return (
      <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
        Não foi possível ler o banco: {erro.message}
      </p>
    );
  }

  const listaCanteiros = canteiros.data ?? [];
  const listaEspecies = especies.data ?? [];

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <section>
        <h2 className="mb-2 text-lg font-medium">Canteiros</h2>
        <ul className="flex flex-col gap-2">
          {listaCanteiros.map((c) => (
            <li key={c.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <span className="font-medium">{c.nome}</span>
              {c.comprimento_m && c.largura_m && (
                <span className="block text-sm text-zinc-500">
                  {c.comprimento_m} m × {c.largura_m} m
                </span>
              )}
            </li>
          ))}
          {listaCanteiros.length === 0 && <li className="text-zinc-500">Nenhum canteiro.</li>}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Espécies</h2>
        <ul className="flex flex-col gap-2">
          {listaEspecies.map((e) => (
            <li key={e.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <span className="font-medium">{e.nome_popular}</span>
              {e.nome_cientifico && (
                <span className="block text-sm italic text-zinc-500">{e.nome_cientifico}</span>
              )}
            </li>
          ))}
          {listaEspecies.length === 0 && <li className="text-zinc-500">Nenhuma espécie.</li>}
        </ul>
      </section>
    </div>
  );
}

/** Mostra "Entrar / Criar conta" para visitante, ou o nome e o botão Sair para quem está logado. */
async function MenuUsuario() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    return (
      <nav className="flex items-center gap-2 text-sm font-medium">
        <Link href="/login" className="rounded-lg px-3 py-2 text-green-800 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950">
          Entrar
        </Link>
        <Link href="/registro" className="rounded-lg bg-green-700 px-3 py-2 text-white hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500">
          Criar conta
        </Link>
      </nav>
    );
  }

  // o gatilho do cadastro liga o login à pessoa (pessoa.user_id)
  const { data: pessoa } = await supabase.from("pessoa").select("nome").eq("user_id", claims.sub).maybeSingle();
  const primeiroNome = pessoa?.nome?.split(" ")[0] ?? claims.email ?? "você";

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-zinc-700 dark:text-zinc-300">
        Olá, <strong>{primeiroNome}</strong>
      </span>
      <form action={sair}>
        <button type="submit" className="rounded-lg border border-zinc-300 px-3 py-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Sair
        </button>
      </form>
    </div>
  );
}
