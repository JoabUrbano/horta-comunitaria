import type { Metadata } from "next";
import { Suspense } from "react";
import { CartaoAuth } from "@/components/cartao-auth";
import { AvisoDaUrl } from "./aviso-da-url";
import { FormLogin } from "./form-login";

export const metadata: Metadata = { title: "Entrar · Horta Comunitária" };

export default function PaginaLogin() {
  return (
    <CartaoAuth titulo="Entrar" subtitulo="Use o e-mail e a senha do seu cadastro.">
      <Suspense>
        <AvisoDaUrl />
      </Suspense>
      <FormLogin />
    </CartaoAuth>
  );
}
