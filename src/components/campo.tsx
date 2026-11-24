"use client";

import { Eye, EyeOff, Loader2, type LucideIcon } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  rotulo: string;
  erro?: string;
  dica?: string;
  icone?: LucideIcon;
};

/**
 * Campo de formulário no padrão dos apps Comigo: rótulo, ícone à esquerda,
 * "olhinho" nos campos de senha, dica e mensagem de erro acessíveis.
 */
export function Campo({ name, rotulo, erro, dica, icone: Icone, type, className, ...input }: Props) {
  const [mostrar, setMostrar] = useState(false);
  const id = `campo-${name}`;
  const idDica = dica ? `${id}-dica` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;
  const ehSenha = type === "password";

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{rotulo}</Label>
      <div className="relative">
        {Icone && <Icone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />}
        <Input
          id={id}
          name={name}
          type={ehSenha && mostrar ? "text" : type}
          aria-invalid={erro ? true : undefined}
          aria-describedby={[idDica, idErro].filter(Boolean).join(" ") || undefined}
          className={cn("h-11 text-base md:text-sm", Icone && "pl-9", ehSenha && "pr-10", className)}
          {...input}
        />
        {ehSenha && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
            onClick={() => setMostrar((m) => !m)}
            aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}
            aria-pressed={mostrar}
          >
            {mostrar ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
          </Button>
        )}
      </div>
      {dica && !erro && (
        <p id={idDica} className="text-xs text-muted-foreground">
          {dica}
        </p>
      )}
      {erro && (
        <p id={idErro} role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}

export function Aviso({ tipo, children }: { tipo: "erro" | "sucesso" | "info"; children: ReactNode }) {
  const cores = {
    erro: "border-destructive/30 bg-destructive/10 text-destructive",
    sucesso: "border-primary/30 bg-accent text-accent-foreground",
    info: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/50 dark:text-amber-100",
  }[tipo];

  return (
    <div role={tipo === "erro" ? "alert" : "status"} className={cn("rounded-lg border p-3 text-sm", cores)}>
      {children}
    </div>
  );
}

export function BotaoEnviar({ pendente, children, textoPendente }: { pendente: boolean; children: ReactNode; textoPendente: string }) {
  return (
    <Button type="submit" disabled={pendente} className="h-11 w-full text-base md:text-sm">
      {pendente ? (
        <>
          <Loader2 className="animate-spin" />
          {textoPendente}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
