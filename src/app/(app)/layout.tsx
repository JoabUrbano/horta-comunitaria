import { Cabecalho } from "@/components/layout/cabecalho";
import { MenuLateral } from "@/components/layout/menu-lateral";
import { Rodape } from "@/components/layout/rodape";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/**
 * Moldura de todas as telas de quem está logado: topo, menu lateral, conteúdo e rodapé.
 * Quem não está logado nem chega aqui: o proxy manda para /login (e o topo confere de novo).
 */
export default function LayoutApp({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider className="flex-col">
      <Cabecalho />
      <div className="flex flex-1">
        <MenuLateral />
        <SidebarInset className="min-h-[calc(100svh-4rem)]">
          <div className="flex-1 p-4 md:p-6">{children}</div>
          <Rodape />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
