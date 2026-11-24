"use client";

import { useSearchParams } from "next/navigation";
import { Aviso } from "@/components/campo";

/** Mostra avisos que chegam pela URL, como /login?aviso=link (vindo do link do e-mail). */
export function AvisoDaUrl() {
  const aviso = useSearchParams().get("aviso");

  if (aviso === "link") {
    return (
      <Aviso tipo="info">
        Não conseguimos concluir pelo link do e-mail (ele pode ter vencido ou sido aberto em outro aparelho). Se você já
        clicou no link antes, seu e-mail está confirmado: é só entrar com sua senha.
      </Aviso>
    );
  }

  return null;
}
