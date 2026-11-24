import type { AuthError } from "@supabase/supabase-js";

/** Traduz os erros do Supabase Auth para mensagens simples, em português. */
export function mensagemErroAuth(error: AuthError, contexto: "login" | "cadastro"): string {
  switch (error.code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_not_confirmed":
      return "Você ainda não confirmou seu e-mail. Abra o link que enviamos (olhe também o spam).";
    case "user_already_exists":
    case "email_exists":
      return "Este e-mail já tem cadastro. Entre com sua senha.";
    case "weak_password":
      return "Senha fraca. Use pelo menos 8 caracteres, com letras e números.";
    case "email_address_invalid":
      return "Este e-mail não é aceito. Confira se está certo.";
    case "signup_disabled":
      return "Os cadastros estão fechados no momento.";
    case "over_email_send_rate_limit":
      // o e-mail gratuito do Supabase manda só 2 por hora; com SMTP próprio o limite sobe
      return "Muitos e-mails enviados em pouco tempo. Tente de novo daqui a pouco (pode levar até 1 hora).";
    case "email_address_not_authorized":
      // o e-mail gratuito do Supabase só envia para quem é da equipe do projeto
      return "Não conseguimos enviar e-mail para este endereço ainda. Fale com quem administra a horta.";
    case "over_request_rate_limit":
      return "Muitas tentativas seguidas. Espere um pouco e tente de novo.";
  }

  console.error(`[auth:${contexto}] erro não tratado do Supabase:`, error.code, error.message);
  return contexto === "login"
    ? "Não foi possível entrar agora. Tente de novo em instantes."
    : "Não foi possível criar a conta agora. Tente de novo em instantes.";
}
