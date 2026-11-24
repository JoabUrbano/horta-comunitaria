import { describe, expect, it } from "vitest";
import {
  formatarTelefone,
  validarCadastro,
  validarConfirmacaoSenha,
  validarEmail,
  validarLogin,
  validarNome,
  validarSenha,
  validarTelefone,
} from "./validacao";

function form(campos: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(campos)) f.set(k, v);
  return f;
}

const cadastroValido = {
  nome: "Ana Souza",
  email: "ana@exemplo.com",
  telefone: "(84) 99999-8888",
  senha: "horta2026",
  confirmarSenha: "horta2026",
};

describe("validarNome", () => {
  it("aceita nome comum, com acento", () => {
    expect(validarNome("José da Silva")).toBeUndefined();
  });
  it("recusa vazio, só espaços, curto e sem letras", () => {
    expect(validarNome("")).toBe("Informe seu nome.");
    expect(validarNome("   ")).toBe("Informe seu nome.");
    expect(validarNome("Al")).toMatch(/pelo menos 3/);
    expect(validarNome("123")).toMatch(/letras/);
  });
  it("recusa nome maior que a coluna do banco", () => {
    expect(validarNome("a".repeat(151))).toMatch(/máximo 150/);
  });
});

describe("validarEmail", () => {
  it("aceita e-mail com maiúsculas e espaços nas pontas", () => {
    expect(validarEmail("  Ana@Exemplo.COM ")).toBeUndefined();
  });
  it("recusa vazio e formatos errados", () => {
    expect(validarEmail("")).toBe("Informe seu e-mail.");
    for (const ruim of ["ana", "ana@", "ana@exemplo", "ana @exemplo.com", "@exemplo.com", "ana@exemplo.c"]) {
      expect(validarEmail(ruim), ruim).toMatch(/inválido/);
    }
  });
});

describe("validarTelefone", () => {
  it("é opcional", () => {
    expect(validarTelefone("")).toBeUndefined();
    expect(validarTelefone("   ")).toBeUndefined();
  });
  it("aceita celular e fixo com DDD, com ou sem máscara", () => {
    expect(validarTelefone("(84) 99999-8888")).toBeUndefined();
    expect(validarTelefone("84999998888")).toBeUndefined();
    expect(validarTelefone("(84) 3222-1111")).toBeUndefined();
  });
  it("recusa sem DDD, DDD com 0 e celular sem o 9", () => {
    expect(validarTelefone("99999-8888")).toMatch(/10 ou 11/);
    expect(validarTelefone("(08) 99999-8888")).toMatch(/DDD/);
    expect(validarTelefone("84899998888")).toMatch(/começa com 9/);
    expect(validarTelefone("849999988881")).toMatch(/10 ou 11/);
  });
});

describe("validarSenha", () => {
  it("aceita letras + números com 8 ou mais", () => {
    expect(validarSenha("horta2026")).toBeUndefined();
  });
  it("recusa vazia, curta, só letras, só números e longa demais", () => {
    expect(validarSenha("")).toBe("Crie uma senha.");
    expect(validarSenha("abc123")).toMatch(/pelo menos 8/);
    expect(validarSenha("somenteletras")).toMatch(/letras e números/);
    expect(validarSenha("12345678")).toMatch(/letras e números/);
    expect(validarSenha("a1".repeat(37))).toMatch(/máximo 72/);
  });
});

describe("validarConfirmacaoSenha", () => {
  it("exige repetir igual", () => {
    expect(validarConfirmacaoSenha("horta2026", "horta2026")).toBeUndefined();
    expect(validarConfirmacaoSenha("horta2026", "")).toBe("Repita a senha.");
    expect(validarConfirmacaoSenha("horta2026", "horta2027")).toMatch(/não são iguais/);
  });
});

describe("formatarTelefone", () => {
  it("aplica a máscara enquanto digita", () => {
    expect(formatarTelefone("")).toBe("");
    expect(formatarTelefone("8")).toBe("(8");
    expect(formatarTelefone("849")).toBe("(84) 9");
    expect(formatarTelefone("8432221111")).toBe("(84) 3222-1111");
    expect(formatarTelefone("84999998888")).toBe("(84) 99999-8888");
    expect(formatarTelefone("84999998888999")).toBe("(84) 99999-8888");
  });
});

describe("validarCadastro", () => {
  it("devolve os dados limpos quando está tudo certo", () => {
    const r = validarCadastro(form({ ...cadastroValido, nome: "  Ana   Souza ", email: " ANA@exemplo.com " }));
    expect(r).toEqual({
      ok: true,
      dados: { nome: "Ana Souza", email: "ana@exemplo.com", telefone: "84999998888", senha: "horta2026" },
    });
  });
  it("telefone vazio vira null", () => {
    const r = validarCadastro(form({ ...cadastroValido, telefone: "" }));
    expect(r.ok && r.dados.telefone).toBeNull();
  });
  it("aponta o erro de cada campo", () => {
    const r = validarCadastro(form({}));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.erros).filter((k) => r.erros[k as keyof typeof r.erros])).toEqual([
        "nome",
        "email",
        "senha",
        "confirmarSenha",
      ]);
    }
  });
});

describe("validarLogin", () => {
  it("só exige e-mail válido e senha preenchida", () => {
    expect(validarLogin(form({ email: "Ana@Exemplo.com", senha: "x" }))).toEqual({
      ok: true,
      dados: { email: "ana@exemplo.com", senha: "x" },
    });
    const r = validarLogin(form({ email: "ana", senha: "" }));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.erros.email).toMatch(/inválido/);
      expect(r.erros.senha).toBe("Informe sua senha.");
    }
  });
});
