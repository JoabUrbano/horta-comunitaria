"use client";

import { FlaskConical } from "lucide-react";
import { PaginaGerenciar, type ConfigGerenciar } from "@/components/gerenciar/pagina-gerenciar";
import { Badge } from "@/components/ui/badge";
import { pastasExemplo, type Pasta } from "@/lib/dados-exemplo";

const config: ConfigGerenciar<Pasta> = {
  titulo: "Gerenciar pastas",
  descricao: "Defensivos caseiros: receita, ingredientes e modo de uso.",
  icone: FlaskConical,
  singular: "pasta",
  plural: "pastas",
  genero: "a",
  campoUnico: "nome",
  itensIniciais: pastasExemplo,
  nomeDe: (p) => p.nome,
  textoBusca: (p) => [p.nome, p.descricao, p.modo_de_uso, ...p.ingredientes.map((i) => i.nome)].filter(Boolean).join(" "),
  campos: [
    { chave: "nome", rotulo: "Nome", tipo: "texto", obrigatorio: true, max: 100, placeholder: "Ex.: Pasta de alho e sabão" },
    { chave: "descricao", rotulo: "Para que serve", tipo: "texto-longo", placeholder: "Ex.: repelente contra pulgão" },
    { chave: "ingredientes", rotulo: "Ingredientes", tipo: "ingredientes" },
    { chave: "modo_de_uso", rotulo: "Modo de uso", tipo: "texto-longo", placeholder: "Passo a passo do preparo e da aplicação" },
  ],
  conteudoCartao: (p) => (
    <>
      {p.descricao && <p className="text-muted-foreground">{p.descricao}</p>}
      {p.ingredientes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {p.ingredientes.map((i) => (
            <Badge key={i.nome} variant="secondary" className="font-normal">
              {i.quantidade} {i.unidade} de {i.nome.toLocaleLowerCase("pt-BR")}
            </Badge>
          ))}
        </div>
      )}
      {p.modo_de_uso && <p className="line-clamp-3 text-xs text-muted-foreground">{p.modo_de_uso}</p>}
    </>
  ),
};

export function GerenciarPastas() {
  return <PaginaGerenciar config={config} />;
}
