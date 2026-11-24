import type { Metadata } from "next";
import { GerenciarCanteiros } from "./gerenciar-canteiros";

export const metadata: Metadata = { title: "Canteiros · Horta Comunitária" };

export default function PaginaCanteiros() {
  return <GerenciarCanteiros />;
}
