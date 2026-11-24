"use client";

import { FlaskConical, Fence, Home, Leaf, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Item = { nome: string; caminho: string; icone: LucideIcon };

const inicio: Item = { nome: "Início", caminho: "/", icone: Home };

export const itensGerenciar: Item[] = [
  { nome: "Canteiros", caminho: "/canteiros", icone: Fence },
  { nome: "Espécies", caminho: "/especies", icone: Leaf },
  { nome: "Pastas", caminho: "/pastas", icone: FlaskConical },
];

/** Menu lateral: fixo e recolhível no computador; gaveta no celular (padrão dos apps Comigo). */
export function MenuLateral() {
  const caminhoAtual = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const ativo = (caminho: string) =>
    caminho === "/" ? caminhoAtual === "/" : caminhoAtual === caminho || caminhoAtual.startsWith(`${caminho}/`);

  function renderItem(item: Item) {
    const Icone = item.icone;
    return (
      <SidebarMenuItem key={item.caminho}>
        <SidebarMenuButton
          asChild
          isActive={ativo(item.caminho)}
          tooltip={item.nome}
          className="h-9 text-[13px] font-medium text-muted-foreground hover:text-foreground data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary"
        >
          <Link href={item.caminho} onClick={() => isMobile && setOpenMobile(false)}>
            <Icone />
            <span>{item.nome}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    // no computador, começa abaixo do topo (h-16), como nos apps Comigo
    <Sidebar collapsible="icon" className="top-16 h-[calc(100svh-4rem)]">
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderItem(inicio)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Gerenciar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{itensGerenciar.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
