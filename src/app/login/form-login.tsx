"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { Aviso, BotaoEnviar, Campo } from "@/components/campo";
import { validarEmail, validarLogin, type CamposLogin, type ErrosCampos } from "@/lib/validacao";
import { entrar } from "../auth/actions";
import type { EstadoLogin } from "../auth/tipos";

const validadores: Record<CamposLogin, (valor: string) => string | undefined> = {
  email: validarEmail,
  senha: (v) => (v ? undefined : "Informe sua senha."),
};

export function FormLogin() {
  const [estado, acao, pendente] = useActionState<EstadoLogin, FormData>(entrar, {});
  // erros vistos na tela; quando o campo já foi validado aqui, vale o daqui
  const [errosLocais, setErrosLocais] = useState<ErrosCampos<CamposLogin>>({});
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const erro = (campo: CamposLogin) => (campo in errosLocais ? errosLocais[campo] : estado.erros?.[campo]);

  function revalidar(campo: CamposLogin, valor: string, soSeJaTemErro = false) {
    if (soSeJaTemErro && !erro(campo)) return;
    setErrosLocais((atual) => ({ ...atual, [campo]: validadores[campo](valor) }));
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    // valida na hora e só chama o servidor se estiver tudo certo
    evento.preventDefault();
    const form = new FormData(evento.currentTarget);
    const validacao = validarLogin(form);
    if (!validacao.ok) {
      setErrosLocais({ email: validacao.erros.email, senha: validacao.erros.senha });
      return;
    }
    setErrosLocais({});
    startTransition(() => acao(form));
  }

  return (
    <form action={acao} onSubmit={enviar} noValidate className="flex flex-col gap-4">
      {estado.mensagem && <Aviso tipo="erro">{estado.mensagem}</Aviso>}

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
        name="senha"
        rotulo="Senha"
        type={mostrarSenha ? "text" : "password"}
        autoComplete="current-password"
        erro={erro("senha")}
        onChange={(e) => revalidar("senha", e.target.value, true)}
      />

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input type="checkbox" checked={mostrarSenha} onChange={(e) => setMostrarSenha(e.target.checked)} />
        Mostrar senha
      </label>

      <BotaoEnviar pendente={pendente} textoPendente="Entrando…">
        Entrar
      </BotaoEnviar>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Ainda não tem conta?{" "}
        <Link href="/registro" className="font-medium text-green-700 underline dark:text-green-400">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
