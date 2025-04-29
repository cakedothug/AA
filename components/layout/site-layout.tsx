import { ReactNode } from "react";
import { SiteHeader } from "./site-header";

interface SiteLayoutProps {
  children: ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-black/40">
      <SiteHeader />
      <main className="flex-1 relative z-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-black/70 pointer-events-none" />
        {children}
      </main>
      <footer className="mt-auto py-8 bg-black/80 border-t border-primary/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-gradient-tokyo">Tokyo Edge RP</h3>
              <p className="text-muted-foreground">
                Uma experiência imersiva de roleplay brasileiro no universo de GTA V
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-muted-foreground hover:text-primary">Início</a></li>
                <li><a href="/news" className="text-muted-foreground hover:text-primary">Notícias</a></li>
                <li><a href="/application" className="text-muted-foreground hover:text-primary">Candidatar-se</a></li>
                <li><a href="/terms" className="text-muted-foreground hover:text-primary">Termos de Serviço</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">Conecte-se</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://discord.gg/tokyoedgerp" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a 
                    href="fivem://connect/45.89.30.198" 
                    className="text-muted-foreground hover:text-primary"
                  >
                    Conectar ao Servidor
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-muted text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Tokyo Edge Roleplay. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}