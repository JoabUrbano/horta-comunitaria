import { Sprout } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AlternarTema } from "@/components/alternar-tema";
import { Skeleton } from "@/components/ui/skeleton";
import { obterUsuarioAtual } from "@/lib/usuario";
import { BotaoMenu } from "./botao-menu";
import { MenuUsuario } from "./menu-usuario";

/** Barra do topo, fixa: menu, marca, tema e conta (padrão dos apps Comigo). */
export function Cabecalho() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <BotaoMenu />
          <Link href="/" className="ml-2 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="size-5" />
            </span>
            <span className="font-semibold">Horta Comunitária</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <AlternarTema />
          <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
            <Conta />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function Conta() {
  const usuario = await obterUsuarioAtual();
  return <MenuUsuario nome={usuario.nome} email={usuario.email} />;
}
