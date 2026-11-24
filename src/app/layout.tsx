import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProvedorTema } from "@/components/provedor-tema";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Horta Comunitária",
  description: "Gestão de canteiros, plantas, pragas e pastas da horta comunitária",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o next-themes coloca a classe do tema no <html> antes do React
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ProvedorTema>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </ProvedorTema>
      </body>
    </html>
  );
}
