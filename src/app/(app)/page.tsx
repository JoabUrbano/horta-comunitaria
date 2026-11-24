import { ArrowRight, FlaskConical, Fence, Leaf, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { obterUsuarioAtual } from "@/lib/usuario";

const atalhos: { titulo: string; descricao: string; caminho: string; icone: LucideIcon }[] = [
  { titulo: "Canteiros", descricao: "Medidas, observações e o grupo responsável.", caminho: "/canteiros", icone: Fence },
  { titulo: "Espécies", descricao: "Os tipos de planta cultivados na horta.", caminho: "/especies", icone: Leaf },
  { titulo: "Pastas", descricao: "Receitas de defensivos caseiros e modo de uso.", caminho: "/pastas", icone: FlaskConical },
];

export default function Inicio() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <Suspense fallback={<Skeleton className="h-8 w-48" />}>
          <Saudacao />
        </Suspense>
        <p className="mt-1 text-sm text-muted-foreground">O que você quer cuidar hoje?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {atalhos.map(({ titulo, descricao, caminho, icone: Icone }) => (
          <Link key={caminho} href={caminho} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
              <CardHeader className="gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icone className="size-5" />
                </span>
                <CardTitle className="flex items-center justify-between text-base">
                  Gerenciar {titulo.toLocaleLowerCase("pt-BR")}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </CardTitle>
                <CardDescription>{descricao}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

async function Saudacao() {
  const usuario = await obterUsuarioAtual();
  return <h1 className="text-2xl font-bold tracking-tight">Olá, {usuario.nome.split(" ")[0]} 👋</h1>;
}
