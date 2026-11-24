"use client";

import { Info, Pencil, Plus, Search, Trash2, X, type LucideIcon } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Ingrediente } from "@/lib/dados-exemplo";
import { cn } from "@/lib/utils";

export type CampoForm = {
  chave: string;
  rotulo: string;
  tipo: "texto" | "numero" | "texto-longo" | "ingredientes";
  obrigatorio?: boolean;
  placeholder?: string;
  dica?: string;
  max?: number;
};

type ValorForm = string | Ingrediente[];
type ValoresForm = Record<string, ValorForm>;
type Erros = Record<string, string | undefined>;

export type ConfigGerenciar<T extends { id: number }> = {
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  /** ex.: "canteiro" */
  singular: string;
  /** ex.: "canteiros" */
  plural: string;
  /** "o" para "Novo canteiro", "a" para "Nova espécie" */
  genero: "o" | "a";
  campos: CampoForm[];
  /** campo que não pode repetir (é UNIQUE no banco) */
  campoUnico: string;
  itensIniciais: T[];
  nomeDe: (item: T) => string;
  textoBusca: (item: T) => string;
  conteudoCartao: (item: T) => ReactNode;
};

function paraForm<T>(campos: CampoForm[], item?: T): ValoresForm {
  const valores: ValoresForm = {};
  for (const c of campos) {
    const v = item ? (item as Record<string, unknown>)[c.chave] : undefined;
    if (c.tipo === "ingredientes") valores[c.chave] = Array.isArray(v) ? (v as Ingrediente[]).map((i) => ({ ...i })) : [];
    else if (c.tipo === "numero") valores[c.chave] = typeof v === "number" ? String(v).replace(".", ",") : "";
    else valores[c.chave] = typeof v === "string" ? v : "";
  }
  return valores;
}

function numero(texto: string) {
  const n = Number(texto.trim().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function deForm(campos: CampoForm[], valores: ValoresForm): Record<string, unknown> {
  const dados: Record<string, unknown> = {};
  for (const c of campos) {
    const v = valores[c.chave];
    if (c.tipo === "ingredientes") {
      dados[c.chave] = (v as Ingrediente[])
        .map((i) => ({ nome: i.nome.trim(), quantidade: i.quantidade.trim(), unidade: i.unidade.trim() }))
        .filter((i) => i.nome);
    } else if (c.tipo === "numero") {
      dados[c.chave] = (v as string).trim() ? numero(v as string) : null;
    } else {
      const t = (v as string).trim().replace(/[ \t]+/g, " ");
      dados[c.chave] = t || null;
    }
  }
  return dados;
}

/**
 * Tela padrão de "Gerenciar X": busca, lista em cartões, cadastrar/editar numa gaveta lateral
 * e excluir com confirmação.
 * Nesta etapa os dados ficam só na memória do navegador (somem ao recarregar).
 */
export function PaginaGerenciar<T extends { id: number }>({ config }: { config: ConfigGerenciar<T> }) {
  const { campos, singular, plural, genero } = config;
  const novoRotulo = `${genero === "o" ? "Novo" : "Nova"} ${singular}`;

  const [itens, setItens] = useState<T[]>(config.itensIniciais);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<T | "novo" | null>(null);
  const [valores, setValores] = useState<ValoresForm>(() => paraForm(campos));
  const [erros, setErros] = useState<Erros>({});
  const [excluindo, setExcluindo] = useState<T | null>(null);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const lista = termo ? itens.filter((i) => config.textoBusca(i).toLocaleLowerCase("pt-BR").includes(termo)) : itens;
    return [...lista].sort((a, b) => config.nomeDe(a).localeCompare(config.nomeDe(b), "pt-BR"));
  }, [itens, busca, config]);

  function abrir(item: T | "novo") {
    setEditando(item);
    setValores(paraForm(campos, item === "novo" ? undefined : item));
    setErros({});
  }

  function validar(v: ValoresForm): Erros {
    const e: Erros = {};
    for (const c of campos) {
      const valor = v[c.chave];
      if (c.tipo === "ingredientes") {
        const lista = valor as Ingrediente[];
        if (lista.some((i) => !i.nome.trim() && (i.quantidade.trim() || i.unidade.trim()))) {
          e[c.chave] = "Toda linha preenchida precisa do nome do ingrediente.";
        } else if (lista.some((i) => i.nome.trim() && (!(numero(i.quantidade) > 0) || !i.unidade.trim()))) {
          e[c.chave] = "Cada ingrediente precisa de quantidade (maior que zero) e unidade.";
        }
        continue;
      }
      const texto = (valor as string).trim();
      if (c.obrigatorio && !texto) e[c.chave] = `Informe ${c.rotulo.toLowerCase()}.`;
      else if (c.max && texto.length > c.max) e[c.chave] = `Use no máximo ${c.max} caracteres.`;
      else if (c.tipo === "numero" && texto && !(numero(texto) > 0)) e[c.chave] = "Use um número maior que zero. Ex.: 2,5";
    }
    const unico = (v[config.campoUnico] as string).trim().toLocaleLowerCase("pt-BR");
    const repetido = itens.some(
      (i) =>
        (editando === "novo" || i.id !== editando?.id) &&
        String((i as Record<string, unknown>)[config.campoUnico] ?? "").toLocaleLowerCase("pt-BR") === unico,
    );
    if (unico && repetido) e[config.campoUnico] = `Já existe ${genero === "o" ? "um" : "uma"} ${singular} com esse nome.`;
    return e;
  }

  function salvar(evento: FormEvent) {
    evento.preventDefault();
    const e = validar(valores);
    setErros(e);
    if (Object.values(e).some(Boolean)) return;

    const dados = deForm(campos, valores);
    if (editando === "novo") {
      const id = Math.max(0, ...itens.map((i) => i.id)) + 1;
      setItens((atual) => [...atual, { id, ...dados } as T]);
    } else if (editando) {
      setItens((atual) => atual.map((i) => (i.id === editando.id ? ({ ...i, ...dados } as T) : i)));
    }
    setEditando(null);
  }

  function mudar(chave: string, valor: ValorForm) {
    setValores((atual) => ({ ...atual, [chave]: valor }));
    if (erros[chave]) setErros((atual) => ({ ...atual, [chave]: undefined }));
  }

  const Icone = config.icone;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icone className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{config.titulo}</h1>
            <p className="text-sm text-muted-foreground">{config.descricao}</p>
          </div>
        </div>
        <Button onClick={() => abrir("novo")} className="h-10">
          <Plus />
          {novoRotulo}
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          <strong>Demonstração:</strong> esta tela ainda não grava no banco. O que você cadastrar, editar ou excluir
          aqui some ao recarregar a página.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar ${plural}…`}
            className="h-10 pl-9"
            aria-label={`Buscar ${plural}`}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filtrados.length} {filtrados.length === 1 ? singular : plural}
        </p>
      </div>

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <Icone className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {busca ? `Nenhum ${singular} encontrado para “${busca}”.` : `Nenhum ${singular} cadastrado ainda.`}
          </p>
          {!busca && (
            <Button variant="outline" onClick={() => abrir("novo")}>
              <Plus />
              {novoRotulo}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((item) => (
            <Card key={item.id} className="gap-3 py-4 transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-2 px-4">
                <CardTitle className="text-base leading-6">{config.nomeDe(item)}</CardTitle>
                <div className="-mt-1 -mr-2 flex shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => abrir(item)}>
                        <Pencil />
                        <span className="sr-only">Editar {config.nomeDe(item)}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setExcluindo(item)}
                      >
                        <Trash2 />
                        <span className="sr-only">Excluir {config.nomeDe(item)}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir</TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 px-4 text-sm">{config.conteudoCartao(item)}</CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={editando !== null} onOpenChange={(aberto) => !aberto && setEditando(null)}>
        <SheetContent className="w-full gap-0 sm:max-w-md">
          <SheetHeader className="border-b">
            <SheetTitle>{editando === "novo" ? novoRotulo : `Editar ${singular}`}</SheetTitle>
            <SheetDescription>Campos com * são obrigatórios.</SheetDescription>
          </SheetHeader>
          <form id="form-gerenciar" onSubmit={salvar} noValidate className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            {campos.map((c) => (
              <CampoGerenciar key={c.chave} campo={c} valor={valores[c.chave]} erro={erros[c.chave]} onChange={(v) => mudar(c.chave, v)} />
            ))}
          </form>
          <SheetFooter className="flex-row justify-end border-t">
            <Button variant="outline" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
            <Button type="submit" form="form-gerenciar">
              Salvar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={excluindo !== null} onOpenChange={(aberto) => !aberto && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {genero} {singular} “{excluindo ? config.nomeDe(excluindo) : ""}”?
            </AlertDialogTitle>
            <AlertDialogDescription>Depois de excluir não dá para desfazer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (excluindo) setItens((atual) => atual.filter((i) => i.id !== excluindo.id));
                setExcluindo(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CampoGerenciar({
  campo,
  valor,
  erro,
  onChange,
}: {
  campo: CampoForm;
  valor: ValorForm;
  erro?: string;
  onChange: (valor: ValorForm) => void;
}) {
  const id = `g-${campo.chave}`;
  const idErro = erro ? `${id}-erro` : undefined;
  const rotulo = `${campo.rotulo}${campo.obrigatorio ? " *" : ""}`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={campo.tipo === "ingredientes" ? undefined : id}>{rotulo}</Label>
      {campo.tipo === "ingredientes" ? (
        <ListaIngredientes valor={valor as Ingrediente[]} onChange={onChange} invalido={Boolean(erro)} />
      ) : campo.tipo === "texto-longo" ? (
        <Textarea
          id={id}
          value={valor as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idErro}
          rows={3}
        />
      ) : (
        <Input
          id={id}
          value={valor as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder}
          inputMode={campo.tipo === "numero" ? "decimal" : undefined}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idErro}
          className="h-10"
        />
      )}
      {campo.dica && !erro && <p className="text-xs text-muted-foreground">{campo.dica}</p>}
      {erro && (
        <p id={idErro} role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}

function ListaIngredientes({
  valor,
  onChange,
  invalido,
}: {
  valor: Ingrediente[];
  onChange: (valor: Ingrediente[]) => void;
  invalido: boolean;
}) {
  function alterar(indice: number, parte: Partial<Ingrediente>) {
    onChange(valor.map((i, n) => (n === indice ? { ...i, ...parte } : i)));
  }

  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border p-2", invalido && "border-destructive")}>
      {valor.length === 0 && <p className="px-1 text-xs text-muted-foreground">Nenhum ingrediente ainda.</p>}
      {valor.map((ing, n) => (
        <div key={n} className="flex items-center gap-2">
          <Input
            value={ing.nome}
            onChange={(e) => alterar(n, { nome: e.target.value })}
            placeholder="Ingrediente"
            aria-label={`Ingrediente ${n + 1}`}
            className="h-9 min-w-0 flex-[2]"
          />
          <Input
            value={ing.quantidade}
            onChange={(e) => alterar(n, { quantidade: e.target.value })}
            placeholder="Qtd."
            inputMode="decimal"
            aria-label={`Quantidade do ingrediente ${n + 1}`}
            className="h-9 w-16 min-w-0"
          />
          <Input
            value={ing.unidade}
            onChange={(e) => alterar(n, { unidade: e.target.value })}
            placeholder="Unidade"
            aria-label={`Unidade do ingrediente ${n + 1}`}
            className="h-9 min-w-0 flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onChange(valor.filter((_, i) => i !== n))}
          >
            <X />
            <span className="sr-only">Remover ingrediente {n + 1}</span>
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start text-primary"
        onClick={() => onChange([...valor, { nome: "", quantidade: "", unidade: "" }])}
      >
        <Plus />
        Adicionar ingrediente
      </Button>
    </div>
  );
}
