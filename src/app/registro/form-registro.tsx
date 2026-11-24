"use client";

import Link from "next/link";
import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";
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

export function FormRegistro() {
  const [estado, acao, pendente] = useActionState<EstadoCadastro, FormData>(cadastrar, {});
  const [errosLocais, setErrosLocais] = useState<ErrosCampos<CamposCadastro>>({});
  const [telefone, setTelefone] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
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
        <Link href="/login" className="text-center text-sm font-medium text-green-700 underline dark:text-green-400">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} action={acao} onSubmit={enviar} noValidate className="flex flex-col gap-4">
      {estado.mensagem && <Aviso tipo="erro">{estado.mensagem}</Aviso>}

      <Campo
        name="nome"
        rotulo="Nome completo"
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
        type={mostrarSenha ? "text" : "password"}
        autoComplete="new-password"
        dica={`Pelo menos ${SENHA_MIN} caracteres, com letras e números.`}
        erro={erro("senha")}
        onBlur={(e) => e.target.value && revalidar("senha", e.target.value)}
        onChange={(e) => revalidar("senha", e.target.value, true)}
      />

      <Campo
        name="confirmarSenha"
        rotulo="Repita a senha"
        type={mostrarSenha ? "text" : "password"}
        autoComplete="new-password"
        erro={erro("confirmarSenha")}
        onBlur={(e) => e.target.value && revalidar("confirmarSenha", e.target.value)}
        onChange={(e) => revalidar("confirmarSenha", e.target.value, true)}
      />

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input type="checkbox" checked={mostrarSenha} onChange={(e) => setMostrarSenha(e.target.checked)} />
        Mostrar senha
      </label>

      <BotaoEnviar pendente={pendente} textoPendente="Criando conta…">
        Criar conta
      </BotaoEnviar>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-green-700 underline dark:text-green-400">
          Entrar
        </Link>
      </p>
    </form>
  );
}
