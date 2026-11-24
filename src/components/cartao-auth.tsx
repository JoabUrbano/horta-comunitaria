import Link from "next/link";

/** Moldura das telas de login e cadastro: centralizada, ocupando a largura toda no celular. */
export function CartaoAuth({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-start justify-center px-4 py-8 sm:items-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="text-lg font-semibold text-green-900 dark:text-green-200">
          🌱 Horta Comunitária
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{titulo}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitulo}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
