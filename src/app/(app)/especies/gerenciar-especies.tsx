"use client";

import { Leaf, Sprout } from "lucide-react";
import { PaginaGerenciar, type ConfigGerenciar } from "@/components/gerenciar/pagina-gerenciar";
import { Badge } from "@/components/ui/badge";
import { especiesExemplo, type Especie } from "@/lib/dados-exemplo";

const config: ConfigGerenciar<Especie> = {
  titulo: "Gerenciar espécies",
  descricao: "Os tipos de planta cultivados na horta.",
  icone: Leaf,
  singular: "espécie",
  plural: "espécies",
  genero: "a",
  campoUnico: "nome_popular",
  itensIniciais: especiesExemplo,
  nomeDe: (e) => e.nome_popular,
  textoBusca: (e) => [e.nome_popular, e.nome_cientifico, e.descricao].filter(Boolean).join(" "),
  campos: [
    { chave: "nome_popular", rotulo: "Nome popular", tipo: "texto", obrigatorio: true, max: 100, placeholder: "Ex.: Alface" },
    { chave: "nome_cientifico", rotulo: "Nome científico", tipo: "texto", max: 150, placeholder: "Ex.: Lactuca sativa" },
    { chave: "descricao", rotulo: "Descrição", tipo: "texto-longo", placeholder: "Cuidados, tempo de colheita…" },
  ],
  conteudoCartao: (e) => (
    <>
      {e.nome_cientifico && <p className="-mt-1 italic text-muted-foreground">{e.nome_cientifico}</p>}
      {e.descricao && <p className="line-clamp-3">{e.descricao}</p>}
      <div className="mt-1">
        <Badge variant="outline" className="gap-1">
          <Sprout className="size-3" />
          {e.plantas ?? 0} {(e.plantas ?? 0) === 1 ? "planta na horta" : "plantas na horta"}
        </Badge>
      </div>
    </>
  ),
};

export function GerenciarEspecies() {
  return <PaginaGerenciar config={config} />;
}
