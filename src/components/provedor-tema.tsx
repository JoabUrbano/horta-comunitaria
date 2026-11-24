"use client";

import { ThemeProvider } from "next-themes";

/** Tema claro por padrão; o escuro só liga pelo botão (e fica lembrado neste navegador). */
export function ProvedorTema({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
