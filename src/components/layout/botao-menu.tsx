"use client";

import { PanelLeft, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

/** Abre/recolhe o menu lateral (no celular, abre a gaveta). */
export function BotaoMenu() {
  const { toggleSidebar, state, isMobile, openMobile } = useSidebar();
  const recolhido = isMobile ? !openMobile : state === "collapsed";
  const texto = isMobile ? "Abrir menu" : recolhido ? "Expandir menu" : "Recolher menu";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9" onClick={toggleSidebar}>
          {recolhido ? <PanelLeft className="size-5" /> : <PanelLeftClose className="size-5" />}
          <span className="sr-only">{texto}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{texto}</TooltipContent>
    </Tooltip>
  );
}
