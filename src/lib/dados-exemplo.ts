/**
 * Dados de exemplo das telas de gerenciar, enquanto elas ainda não falam com o banco.
 * Os nomes e números batem com supabase/seed.sql.
 */

export type Ingrediente = { nome: string; quantidade: string; unidade: string };

export type Canteiro = {
  id: number;
  nome: string;
  comprimento_m: number | null;
  largura_m: number | null;
  observacoes: string | null;
  // só leitura nesta etapa (vem de grupo.canteiro_id e de planta.canteiro_id)
  grupo?: string | null;
  plantas?: number;
};

export type Especie = {
  id: number;
  nome_popular: string;
  nome_cientifico: string | null;
  descricao: string | null;
  plantas?: number;
};

export type Pasta = {
  id: number;
  nome: string;
  descricao: string | null;
  modo_de_uso: string | null;
  ingredientes: Ingrediente[];
};

export const canteirosExemplo: Canteiro[] = [
  { id: 1, nome: "Canteiro A", comprimento_m: 3, largura_m: 1.2, observacoes: "Perto da torneira.", grupo: "Grupo das Folhosas", plantas: 2 },
  { id: 2, nome: "Canteiro B", comprimento_m: 2.5, largura_m: 1, observacoes: null, grupo: "Grupo dos Tomates", plantas: 2 },
  { id: 3, nome: "Canteiro C", comprimento_m: 2, largura_m: 1, observacoes: "Recebe sol só pela manhã.", grupo: null, plantas: 0 },
];

export const especiesExemplo: Especie[] = [
  { id: 1, nome_popular: "Alface", nome_cientifico: "Lactuca sativa", descricao: "Folhosa de ciclo curto. Colheita em 45 a 60 dias.", plantas: 2 },
  { id: 2, nome_popular: "Tomate", nome_cientifico: "Solanum lycopersicum", descricao: "Precisa de tutor e sol pleno.", plantas: 2 },
  { id: 3, nome_popular: "Manjericão", nome_cientifico: "Ocimum basilicum", descricao: "Erva aromática; afasta alguns insetos.", plantas: 1 },
];

export const pastasExemplo: Pasta[] = [
  {
    id: 1,
    nome: "Pasta de alho e sabão",
    descricao: "Repelente caseiro contra insetos de corpo mole.",
    modo_de_uso: "Bater o alho com a água, misturar o sabão e borrifar nas folhas no fim da tarde.",
    ingredientes: [
      { nome: "Alho", quantidade: "5", unidade: "dentes" },
      { nome: "Sabão de coco", quantidade: "1", unidade: "colher de sopa" },
      { nome: "Água", quantidade: "1000", unidade: "ml" },
    ],
  },
];
