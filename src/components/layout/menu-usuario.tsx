"use client";

import { LogOut } from "lucide-react";
import { useState, useTransition } from "react";
import { sair } from "@/app/auth/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "?";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

/** Avatar com as iniciais; abre o menu com o nome, o e-mail e o "Sair" (com confirmação). */
export function MenuUsuario({ nome, email }: { nome: string; email: string }) {
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [saindo, iniciarSaida] = useTransition();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-sm text-primary-foreground">{iniciais(nome)}</AvatarFallback>
          </Avatar>
          <span className="sr-only">Abrir menu da conta</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-sm font-medium">{nome}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => {
              e.preventDefault();
              setConfirmarSaida(true);
            }}
          >
            <LogOut />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmarSaida} onOpenChange={setConfirmarSaida}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
            <AlertDialogDescription>Você precisará entrar novamente para acessar a horta.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={saindo}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                iniciarSaida(async () => {
                  await sair();
                  // recarrega tudo: o Next guarda as telas visitadas na memória, e o próximo
                  // usuário deste navegador não pode ver o que o anterior deixou aberto
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- recarga completa proposital (guia "preserving-ui-state" do Next)
                  window.location.href = "/login";
                });
              }}
            >
              {saindo ? "Saindo…" : "Sair"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
