"use client";

import { Fence, Sprout, Users } from "lucide-react";
import { PaginaGerenciar, type ConfigGerenciar } from "@/components/gerenciar/pagina-gerenciar";
import { Badge } from "@/components/ui/badge";
import { canteirosExemplo, type Canteiro } from "@/lib/dados-exemplo";

const metros = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const config: ConfigGerenciar<Canteiro> = {
  titulo: "Gerenciar canteiros",
  descricao: "Os canteiros da horta, com medidas e o grupo que cuida de cada um.",
  icone: Fence,
  singular: "canteiro",
  plural: "canteiros",
  genero: "o",
  campoUnico: "nome",
  itensIniciais: canteirosExemplo,
  nomeDe: (c) => c.nome,
  textoBusca: (c) => [c.nome, c.observacoes, c.grupo].filter(Boolean).join(" "),
  campos: [
    { chave: "nome", rotulo: "Nome", tipo: "texto", obrigatorio: true, max: 100, placeholder: "Ex.: Canteiro A" },
    { chave: "comprimento_m", rotulo: "Comprimento (m)", tipo: "numero", placeholder: "Ex.: 3,00" },
    { chave: "largura_m", rotulo: "Largura (m)", tipo: "numero", placeholder: "Ex.: 1,20" },
    { chave: "observacoes", rotulo: "Observações", tipo: "texto-longo", placeholder: "Ex.: perto da torneira" },
  ],
  conteudoCartao: (c) => (
    <>
      {c.comprimento_m && c.largura_m ? (
        <p className="text-muted-foreground">
          {metros(c.comprimento_m)} m × {metros(c.largura_m)} m ·{" "}
          <span className="font-medium text-foreground">{metros(c.comprimento_m * c.largura_m)} m²</span>
        </p>
      ) : (
        <p className="text-muted-foreground">Medidas não informadas</p>
      )}
      {c.observacoes && <p className="line-clamp-2">{c.observacoes}</p>}
      <div className="mt-1 flex flex-wrap gap-2">
        <Badge variant={c.grupo ? "secondary" : "outline"} className="gap-1">
          <Users className="size-3" />
          {c.grupo ?? "Sem grupo"}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Sprout className="size-3" />
          {c.plantas ?? 0} {(c.plantas ?? 0) === 1 ? "planta" : "plantas"}
        </Badge>
      </div>
    </>
  ),
};

export function GerenciarCanteiros() {
  return <PaginaGerenciar config={config} />;
}
