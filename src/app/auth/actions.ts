"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mensagemErroAuth } from "@/lib/supabase/erros";
import { validarCadastro, validarLogin } from "@/lib/validacao";
import type { EstadoCadastro, EstadoLogin } from "./tipos";

export async function entrar(_anterior: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  // valida de novo no servidor: quem chama a ação direto não passa pela tela
  const validacao = validarLogin(form);
  if (!validacao.ok) return { erros: validacao.erros };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validacao.dados.email,
    password: validacao.dados.senha,
  });

  if (error) return { mensagem: mensagemErroAuth(error, "login") };

  redirect("/");
}

export async function cadastrar(_anterior: EstadoCadastro, form: FormData): Promise<EstadoCadastro> {
  const validacao = validarCadastro(form);
  if (!validacao.ok) return { erros: validacao.erros };

  const { nome, email, telefone, senha } = validacao.dados;
  const origem = (await headers()).get("origin") ?? "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      // o link do e-mail de confirmação volta para cá e já deixa a pessoa logada
      emailRedirectTo: `${origem}/auth/callback`,
      // o gatilho do banco usa estes dados para criar a linha em `pessoa`
      data: { nome, telefone },
    },
  });

  if (error) return { mensagem: mensagemErroAuth(error, "cadastro") };

  // Com confirmação de e-mail ligada, o Supabase não dá erro para e-mail já
  // cadastrado (para não revelar quem tem conta): devolve um usuário sem identidades.
  if (data.user && data.user.identities?.length === 0) {
    return { mensagem: "Este e-mail já tem cadastro. Entre com sua senha." };
  }

  // confirmação de e-mail desligada no Supabase: já entra direto
  if (data.session) redirect("/");

  return { sucesso: { email } };
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
