import type { Metadata } from "next";
import { GerenciarPastas } from "./gerenciar-pastas";

export const metadata: Metadata = { title: "Pastas · Horta Comunitária" };

export default function PaginaPastas() {
  return <GerenciarPastas />;
}
