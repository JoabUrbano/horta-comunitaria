import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  rotulo: string;
  erro?: string;
  dica?: string;
};

/** Campo de formulário com rótulo, dica e mensagem de erro acessíveis. */
export function Campo({ name, rotulo, erro, dica, className, ...input }: Props) {
  const id = `campo-${name}`;
  const idDica = dica ? `${id}-dica` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {rotulo}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={erro ? true : undefined}
        aria-describedby={[idDica, idErro].filter(Boolean).join(" ") || undefined}
        className={`h-11 rounded-lg border bg-white px-3 text-base text-zinc-900 outline-none transition-colors focus:ring-2 dark:bg-zinc-900 dark:text-zinc-100 ${
          erro
            ? "border-red-500 focus:ring-red-300 dark:border-red-500 dark:focus:ring-red-800"
            : "border-zinc-300 focus:border-green-600 focus:ring-green-200 dark:border-zinc-700 dark:focus:ring-green-900"
        } ${className ?? ""}`}
        {...input}
      />
      {dica && !erro && (
        <p id={idDica} className="text-xs text-zinc-500">
          {dica}
        </p>
      )}
      {erro && (
        <p id={idErro} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {erro}
        </p>
      )}
    </div>
  );
}

export function Aviso({ tipo, children }: { tipo: "erro" | "sucesso" | "info"; children: React.ReactNode }) {
  const cores = {
    erro: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
    sucesso: "border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
    info: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100",
  }[tipo];

  return (
    <div role={tipo === "erro" ? "alert" : "status"} className={`rounded-lg border p-3 text-sm ${cores}`}>
      {children}
    </div>
  );
}

export function BotaoEnviar({ pendente, children, textoPendente }: { pendente: boolean; children: React.ReactNode; textoPendente: string }) {
  return (
    <button
      type="submit"
      disabled={pendente}
      className="h-11 rounded-lg bg-green-700 px-4 font-medium text-white transition-colors hover:bg-green-800 disabled:cursor-wait disabled:opacity-70 dark:bg-green-600 dark:hover:bg-green-500"
    >
      {pendente ? textoPendente : children}
    </button>
  );
}
