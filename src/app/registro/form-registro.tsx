"use client";

import { Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useCallback, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Aviso, BotaoEnviar, Campo } from "@/components/campo";
import {
  SENHA_MIN,
  formatarTelefone,
  validarCadastro,
  validarConfirmacaoSenha,
  validarEmail,
  validarNome,
  validarSenha,
  validarTelefone,
  type CamposCadastro,
  type ErrosCampos,
} from "@/lib/validacao";
import { cadastrar } from "../auth/actions";
import type { EstadoCadastro } from "../auth/tipos";

/**
 * O Next 16 não desmonta a página ao navegar: esconde e mostra de novo como estava.
 * Sem isto, quem criava uma conta, saía e voltava para "Criar conta" via o aviso
 * "Confirme seu e-mail" do cadastro anterior, sem o formulário.
 * Cada "rodada" é um formulário novo; trocar a chave recomeça do zero.
 */
export function FormRegistro() {
  const [rodada, setRodada] = useState(0);
  // só avança se ainda estiver nesta rodada (evita reiniciar duas vezes)
  const reiniciar = useCallback((daRodada: number) => setRodada((atual) => (atual === daRodada ? atual + 1 : atual)), []);
  return <Formulario key={rodada} rodada={rodada} reiniciar={reiniciar} />;
}

function Formulario({ rodada, reiniciar }: { rodada: number; reiniciar: (daRodada: number) => void }) {
  const [estado, acao, pendente] = useActionState<EstadoCadastro, FormData>(cadastrar, {});

  // depois de um cadastro com sucesso, ao sair da tela (ela fica escondida), já deixa um formulário limpo
  const cadastrou = Boolean(estado.sucesso);
  useLayoutEffect(() => {
    if (!cadastrou) return;
    return () => reiniciar(rodada);
  }, [cadastrou, reiniciar, rodada]);
  const [errosLocais, setErrosLocais] = useState<ErrosCampos<CamposCadastro>>({});
  const [telefone, setTelefone] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const erro = (campo: CamposCadastro) => (campo in errosLocais ? errosLocais[campo] : estado.erros?.[campo]);

  function valorDe(campo: CamposCadastro) {
    const v = formRef.current?.elements.namedItem(campo);
    return v instanceof HTMLInputElement ? v.value : "";
  }

  function validarCampo(campo: CamposCadastro, valor: string) {
    switch (campo) {
      case "nome":
        return validarNome(valor);
      case "email":
        return validarEmail(valor);
      case "telefone":
        return validarTelefone(valor);
      case "senha":
        return validarSenha(valor);
      case "confirmarSenha":
        return validarConfirmacaoSenha(valorDe("senha"), valor);
    }
  }

  function revalidar(campo: CamposCadastro, valor: string, soSeJaTemErro = false) {
    if (soSeJaTemErro && !erro(campo)) return;
    setErrosLocais((atual) => {
      const novo = { ...atual, [campo]: validarCampo(campo, valor) };
      // mudou a senha: a confirmação precisa ser conferida de novo
      if (campo === "senha" && (atual.confirmarSenha || estado.erros?.confirmarSenha) && valorDe("confirmarSenha")) {
        novo.confirmarSenha = validarConfirmacaoSenha(valor, valorDe("confirmarSenha"));
      }
      return novo;
    });
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = new FormData(evento.currentTarget);
    const validacao = validarCadastro(form);
    if (!validacao.ok) {
      setErrosLocais({ ...validacao.erros });
      // leva o foco para o primeiro campo com problema
      const primeiro = (Object.keys(validacao.erros) as CamposCadastro[]).find((c) => validacao.erros[c]);
      if (primeiro) (formRef.current?.elements.namedItem(primeiro) as HTMLInputElement | null)?.focus();
      return;
    }
    setErrosLocais({});
    startTransition(() => acao(form));
  }

  if (estado.sucesso) {
    return (
      <div className="flex flex-col gap-4">
        <Aviso tipo="sucesso">
          <p className="font-medium">Quase lá! Confirme seu e-mail.</p>
          <p className="mt-1">
            Enviamos um link para <strong>{estado.sucesso.email}</strong>. Abra o e-mail (olhe também a caixa de spam) e
            clique no link para ativar a conta.
          </p>
        </Aviso>
        <Button asChild className="h-11">
          <Link href="/login">Ir para o login</Link>
        </Button>
        <Button variant="ghost" onClick={() => reiniciar(rodada)}>
          Criar outra conta
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={acao} onSubmit={enviar} noValidate className="flex flex-col gap-4">
      {estado.mensagem && <Aviso tipo="erro">{estado.mensagem}</Aviso>}

      <Campo
        name="nome"
        rotulo="Nome completo"
        icone={User}
        autoComplete="name"
        autoCapitalize="words"
        maxLength={150}
        erro={erro("nome")}
        onBlur={(e) => e.target.value && revalidar("nome", e.target.value)}
        onChange={(e) => revalidar("nome", e.target.value, true)}
      />

      <Campo
        name="email"
        rotulo="E-mail"
        icone={Mail}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="nome@email.com"
        erro={erro("email")}
        onBlur={(e) => e.target.value && revalidar("email", e.target.value)}
        onChange={(e) => revalidar("email", e.target.value, true)}
      />

      <Campo
        name="telefone"
        rotulo="Telefone (opcional)"
        icone={Phone}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="(84) 99999-8888"
        dica="Com DDD. Ajuda o grupo a falar com você."
        value={telefone}
        erro={erro("telefone")}
        onBlur={(e) => revalidar("telefone", e.target.value)}
        onChange={(e) => {
          const formatado = formatarTelefone(e.target.value);
          setTelefone(formatado);
          revalidar("telefone", formatado, true);
        }}
      />

      <Campo
        name="senha"
        rotulo="Senha"
        icone={Lock}
        type="password"
        autoComplete="new-password"
        dica={`Pelo menos ${SENHA_MIN} caracteres, com letras e números.`}
        erro={erro("senha")}
        onBlur={(e) => e.target.value && revalidar("senha", e.target.value)}
        onChange={(e) => revalidar("senha", e.target.value, true)}
      />

      <Campo
        name="confirmarSenha"
        rotulo="Repita a senha"
        icone={Lock}
        type="password"
        autoComplete="new-password"
        erro={erro("confirmarSenha")}
        onBlur={(e) => e.target.value && revalidar("confirmarSenha", e.target.value)}
        onChange={(e) => revalidar("confirmarSenha", e.target.value, true)}
      />


      <BotaoEnviar pendente={pendente} textoPendente="Criando conta…">
        Criar conta
      </BotaoEnviar>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
