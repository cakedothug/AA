import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-bold tracking-tight">Página não encontrada</h2>
        <p className="text-muted-foreground text-xl max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex gap-4 mt-4">
          <Button asChild>
            <Link href="/">
              Voltar para Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://discord.gg/tokyoedgerp" target="_blank" rel="noopener noreferrer">
              Suporte no Discord
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}