import type { CamposCadastro, CamposLogin, ErrosCampos } from "@/lib/validacao";

export type EstadoLogin = {
  erros?: ErrosCampos<CamposLogin>;
  mensagem?: string;
};

export type EstadoCadastro = {
  erros?: ErrosCampos<CamposCadastro>;
  mensagem?: string;
  /** preenchido quando a conta foi criada e falta confirmar o e-mail */
  sucesso?: { email: string };
};
