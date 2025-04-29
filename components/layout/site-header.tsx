import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { useAuth } from "@/hooks/use-auth";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import { SiDiscord } from "react-icons/si";
import { Menu, X, Signal, Shield } from "lucide-react";
import { useState } from "react";
import { useServerStats } from "@/hooks/use-server-stats";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SiteHeader() {
  const { user, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverStats, connected] = useServerStats();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-black/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <span className="text-2xl font-bold text-gradient-tokyo">Tokyo Edge</span>
          </Link>
          
          <NavigationMenu className="hidden md:flex ml-4">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/">
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link href="/news">
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    Notícias
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link href="/application">
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    Candidatar-se
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link href="/guidelines">
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    Regras
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary">
                  Sobre
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-3 p-4 bg-black/95 backdrop-blur-md border border-primary/20">
                    <li>
                      <Link href="/team">
                        <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary">
                          <div className="text-sm font-medium leading-none">Equipe</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Conheça nossa equipe
                          </p>
                        </NavigationMenuLink>
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms">
                        <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary">
                          <div className="text-sm font-medium leading-none">Termos de Serviço</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Leia nossos termos
                          </p>
                        </NavigationMenuLink>
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy">
                        <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary">
                          <div className="text-sm font-medium leading-none">Política de Privacidade</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Como usamos seus dados
                          </p>
                        </NavigationMenuLink>
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden ml-2 p-2 text-foreground" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Server Status Indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden md:flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${serverStats.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-xs font-medium">
                    {serverStats.players}/{serverStats.maxPlayers}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <p className={`${serverStats.online ? 'text-green-500' : 'text-red-500'} font-bold`}>
                    {serverStats.online ? 'Servidor Online' : 'Servidor Offline'}
                  </p>
                  <p>Jogadores: {serverStats.players}/{serverStats.maxPlayers}</p>
                  <p>Ping: {serverStats.ping || 'N/A'}ms</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <a 
            href="https://discord.gg/tokyoedgerp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex text-muted-foreground hover:text-primary transition-colors"
          >
            <SiDiscord className="h-5 w-5" />
          </a>
          
          {isLoading ? (
            <Button variant="ghost" size="sm" disabled>
              Carregando...
            </Button>
          ) : user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <Link href="/admin/dashboard">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-primary/50 hover:bg-primary/10 text-primary"
                  >
                    Admin
                  </Button>
                </Link>
              )}
              <UserNav />
            </div>
          ) : (
            <Link href="/login">
              <Button 
                variant="default" 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-primary/20 backdrop-blur-md">
          <nav className="container py-4">
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <a className="block py-2 px-4 hover:bg-primary/10 hover:text-primary rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Home
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/news">
                  <a className="block py-2 px-4 hover:bg-primary/10 hover:text-primary rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Notícias
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/application">
                  <a className="block py-2 px-4 hover:bg-primary/10 hover:text-primary rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Candidatar-se
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/guidelines">
                  <a className="block py-2 px-4 hover:bg-primary/10 hover:text-primary rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Regras
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/team">
                  <a className="block py-2 px-4 hover:bg-primary/10 hover:text-primary rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Equipe
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="block py-2 px-4 hover:bg-primary/10 hover:text-primary rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Termos de Serviço
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="block py-2 px-4 hover:bg-primary/10 hover:text-primary rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Política de Privacidade
                  </a>
                </Link>
              </li>
              <li>
                <a 
                  href="https://discord.gg/tokyoedgerp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 px-4 hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <SiDiscord className="h-4 w-4" />
                  Discord
                </a>
              </li>
              
              {/* Link admin (apenas para administradores) */}
              {user && user.role === 'admin' && (
                <li>
                  <Link href="/admin/dashboard">
                    <a className="flex items-center gap-2 py-2 px-4 bg-primary/10 text-primary rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <Shield className="h-4 w-4" />
                      Painel Admin
                    </a>
                  </Link>
                </li>
              )}
              
              {/* Server Status no menu mobile */}
              <li>
                <div className="flex items-center justify-between py-2 px-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${serverStats.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={serverStats.online ? 'text-green-500' : 'text-red-500'}>
                      {serverStats.online ? 'Servidor Online' : 'Servidor Offline'}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {serverStats.players}/{serverStats.maxPlayers}
                  </span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}