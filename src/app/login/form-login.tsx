"use client";

import { Lock, Mail } from "lucide-react";
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
        name="senha"
        rotulo="Senha"
        icone={Lock}
        type="password"
        autoComplete="current-password"
        erro={erro("senha")}
        onChange={(e) => revalidar("senha", e.target.value, true)}
      />


      <BotaoEnviar pendente={pendente} textoPendente="Entrando…">
        Entrar
      </BotaoEnviar>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href="/registro" className="font-medium text-primary underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
