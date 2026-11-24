/**
 * Validações dos formulários de login e cadastro.
 *
 * O mesmo código roda no navegador (para avisar na hora) e no servidor
 * (que é a validação que vale: quem chama a ação direto não passa pela tela).
 */

export type ErrosCampos<Campo extends string> = Partial<Record<Campo, string>>;

export type CamposCadastro = "nome" | "email" | "telefone" | "senha" | "confirmarSenha";
export type CamposLogin = "email" | "senha";

export type DadosCadastro = {
  nome: string;
  email: string;
  telefone: string | null; // só dígitos, com DDD
  senha: string;
};

export type DadosLogin = {
  email: string;
  senha: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const SENHA_MIN = 8;
// o Supabase (bcrypt) ignora o que passa de 72 caracteres
export const SENHA_MAX = 72;
export const NOME_MAX = 150;

export function normalizarEmail(email: string) {
  return email.trim().toLowerCase();
}

export function somenteDigitos(texto: string) {
  return texto.replace(/\D/g, "");
}

export function validarNome(nome: string): string | undefined {
  const limpo = nome.trim().replace(/\s+/g, " ");
  if (!limpo) return "Informe seu nome.";
  if (limpo.length < 3) return "O nome precisa ter pelo menos 3 letras.";
  if (limpo.length > NOME_MAX) return `O nome pode ter no máximo ${NOME_MAX} caracteres.`;
  if (!/\p{L}/u.test(limpo)) return "O nome precisa ter letras.";
  return undefined;
}

export function validarEmail(email: string): string | undefined {
  const limpo = normalizarEmail(email);
  if (!limpo) return "Informe seu e-mail.";
  if (limpo.length > 255 || !EMAIL_REGEX.test(limpo)) return "E-mail inválido. Exemplo: nome@email.com";
  return undefined;
}

/** Telefone é opcional. Se vier, precisa ter DDD + número (10 ou 11 dígitos). */
export function validarTelefone(telefone: string): string | undefined {
  const digitos = somenteDigitos(telefone);
  if (!digitos) return undefined;
  if (digitos.length !== 10 && digitos.length !== 11) {
    return "Telefone com DDD: 10 ou 11 números. Exemplo: (84) 99999-8888";
  }
  if (digitos[0] === "0") return "O DDD não começa com 0.";
  if (digitos.length === 11 && digitos[2] !== "9") return "Celular com 11 números começa com 9 depois do DDD.";
  return undefined;
}

export function validarSenha(senha: string): string | undefined {
  if (!senha) return "Crie uma senha.";
  if (senha.length < SENHA_MIN) return `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`;
  if (senha.length > SENHA_MAX) return `A senha pode ter no máximo ${SENHA_MAX} caracteres.`;
  if (!/\p{L}/u.test(senha) || !/\d/.test(senha)) return "A senha precisa ter letras e números.";
  return undefined;
}

export function validarConfirmacaoSenha(senha: string, confirmacao: string): string | undefined {
  if (!confirmacao) return "Repita a senha.";
  if (senha !== confirmacao) return "As senhas não são iguais.";
  return undefined;
}

/** Deixa o telefone no formato (84) 99999-8888 enquanto a pessoa digita. */
export function formatarTelefone(texto: string) {
  const d = somenteDigitos(texto).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  if (resto.length <= 4) return `(${ddd}) ${resto}`;
  const corte = resto.length === 9 ? 5 : 4;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

function texto(form: FormData, campo: string) {
  const valor = form.get(campo);
  return typeof valor === "string" ? valor : "";
}

function semErros<Campo extends string>(erros: ErrosCampos<Campo>) {
  return Object.values(erros).every((e) => !e);
}

export function validarCadastro(
  form: FormData,
): { ok: true; dados: DadosCadastro } | { ok: false; erros: ErrosCampos<CamposCadastro> } {
  const nome = texto(form, "nome");
  const email = texto(form, "email");
  const telefone = texto(form, "telefone");
  const senha = texto(form, "senha");
  const confirmarSenha = texto(form, "confirmarSenha");

  const erros: ErrosCampos<CamposCadastro> = {
    nome: validarNome(nome),
    email: validarEmail(email),
    telefone: validarTelefone(telefone),
    senha: validarSenha(senha),
    confirmarSenha: validarConfirmacaoSenha(senha, confirmarSenha),
  };

  if (!semErros(erros)) return { ok: false, erros };

  return {
    ok: true,
    dados: {
      nome: nome.trim().replace(/\s+/g, " "),
      email: normalizarEmail(email),
      telefone: somenteDigitos(telefone) || null,
      senha,
    },
  };
}

export function validarLogin(
  form: FormData,
): { ok: true; dados: DadosLogin } | { ok: false; erros: ErrosCampos<CamposLogin> } {
  const email = texto(form, "email");
  const senha = texto(form, "senha");

  const erros: ErrosCampos<CamposLogin> = {
    email: validarEmail(email),
    // no login não repetimos as regras de força da senha: só não pode estar vazia
    senha: senha ? undefined : "Informe sua senha.",
  };

  if (!semErros(erros)) return { ok: false, erros };
  return { ok: true, dados: { email: normalizarEmail(email), senha } };
}
