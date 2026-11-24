import type { Metadata } from "next";
import { CartaoAuth } from "@/components/cartao-auth";
import { FormRegistro } from "./form-registro";

export const metadata: Metadata = { title: "Criar conta · Horta Comunitária" };

export default function PaginaRegistro() {
  return (
    <CartaoAuth titulo="Criar conta" subtitulo="Cadastre-se para participar da horta.">
      <FormRegistro />
    </CartaoAuth>
  );
}
