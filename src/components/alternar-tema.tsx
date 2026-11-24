"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AlternarTema() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {/* os dois ícones ficam no HTML e o CSS mostra um: evita piscar ao carregar */}
          <Sun className="size-5 dark:hidden" />
          <Moon className="hidden size-5 dark:block" />
          <span className="sr-only">Alternar tema claro/escuro</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span className="dark:hidden">Modo escuro</span>
        <span className="hidden dark:inline">Modo claro</span>
      </TooltipContent>
    </Tooltip>
  );
}
