import type { Metadata } from "next";
import { GerenciarEspecies } from "./gerenciar-especies";

export const metadata: Metadata = { title: "Espécies · Horta Comunitária" };

export default function PaginaEspecies() {
  return <GerenciarEspecies />;
}
