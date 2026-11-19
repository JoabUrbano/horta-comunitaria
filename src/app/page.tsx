import { Suspense } from "react";
import { createClient, supabaseConfigurado } from "@/lib/supabase/server";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-green-900 dark:text-green-200">
          🌱 Horta Comunitária
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Canteiros, plantas, pragas e pastas da horta.
        </p>
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
