import { Sprout } from "lucide-react";
import { AlternarTema } from "@/components/alternar-tema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Moldura das telas de login e cadastro, no padrão do Auth dos apps Comigo. */
export function CartaoAuth({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh flex-1 items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 right-4">
        <AlternarTema />
      </div>
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="gap-3 text-center">
          <div className="mx-auto flex items-center gap-2 text-primary">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sprout className="size-6" />
            </span>
            <span className="text-lg font-semibold text-foreground">Horta Comunitária</span>
          </div>
          <CardTitle className="text-2xl font-bold">{titulo}</CardTitle>
          <CardDescription>{subtitulo}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
    </main>
  );
}
