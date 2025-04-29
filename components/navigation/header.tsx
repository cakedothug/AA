import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { getDiscordLoginUrl } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { getServerStatus } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import useMobile from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, Settings, LogOut } from "lucide-react";

const Header: React.FC<{ isAuthenticated?: boolean; isAdmin?: boolean }> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMobile();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: serverStatus } = useQuery({
    queryKey: ["/api/server/status"],
    select: (data) => ({
      online: data.online,
      players: `${data.players}/${data.maxPlayers}`
    }),
    staleTime: 60000, // 1 minute
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <header className="bg-[#121212] sticky top-0 z-50 border-b border-[#2D2D2D]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="font-rajdhani font-bold text-2xl">
                <span className="text-white">TOKYO</span>
                <span className="text-[#00E5FF]">EDGE</span>
                <span className="text-[#FF0A54]">RP</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-[#00E5FF] transition-colors font-medium">Início</Link>
            <Link href="/#about" className="text-white hover:text-[#00E5FF] transition-colors font-medium">Sobre</Link>
            <Link href="/#features" className="text-white hover:text-[#00E5FF] transition-colors font-medium">Funcionalidades</Link>
            <Link href="/news" className="text-white hover:text-[#00E5FF] transition-colors font-medium">Notícias</Link>
            <Link href="/guidelines" className="text-white hover:text-[#00E5FF] transition-colors font-medium">Regras</Link>
            <Link href="/#join" className="text-white hover:text-[#00E5FF] transition-colors font-medium">Como Entrar</Link>
            <Link href="/team" className="text-white hover:text-[#00E5FF] transition-colors font-medium">Equipe</Link>
          </nav>

          {/* Server Status & Login Button */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full ${serverStatus?.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'} mr-2`}></div>
              <div className="text-sm text-white/70">
                <span>{serverStatus?.players || '0/0'}</span> online
              </div>
            </div>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-[#2D2D2D] bg-[#1A1A1A] text-white hover:bg-[#2D2D2D] hover:text-white"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user?.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#1A1A1A] border-[#2D2D2D] text-white">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setLocation('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Meu Perfil</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => setLocation('/admin/dashboard')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Painel Admin</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-[#2D2D2D]" />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="cyberpunk-btn bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black rounded-md px-3.5 py-2 text-sm font-medium">
                  Entrar
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-[#00E5FF] focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobile && isMobileMenuOpen && (
        <nav className="px-4 py-3 space-y-2 bg-[#1A1A1A] border-b border-[#2D2D2D]">
          <Link href="/" className="flex items-center py-2 text-white hover:text-[#00E5FF]">Início</Link>
          <Link href="/#about" className="flex items-center py-2 text-white hover:text-[#00E5FF]">Sobre</Link>
          <Link href="/#features" className="flex items-center py-2 text-white hover:text-[#00E5FF]">Funcionalidades</Link>
          <Link href="/news" className="flex items-center py-2 text-white hover:text-[#00E5FF]">Notícias</Link>
          <Link href="/guidelines" className="flex items-center py-2 text-white hover:text-[#00E5FF]">Regras</Link>
          <Link href="/#join" className="flex items-center py-2 text-white hover:text-[#00E5FF]">Como Entrar</Link>
          <Link href="/team" className="flex items-center py-2 text-white hover:text-[#00E5FF]">Equipe</Link>

          <div className="pt-2 pb-1 border-t border-[#2D2D2D]">
            <div className="flex items-center py-2">
              <div className={`h-2 w-2 rounded-full ${serverStatus?.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'} mr-2`}></div>
              <div className="text-sm text-white/70">
                <span>{serverStatus?.players || '0/0'}</span> online
              </div>
            </div>

            {isAuthenticated ? (
              <div className="space-y-2">
                <Link href="/profile" className="flex items-center py-2 text-white hover:text-[#00E5FF]">
                  <User className="h-4 w-4 mr-2" />
                  Meu Perfil
                </Link>
                {isAdmin && (
                  <Link href="/admin/dashboard" className="flex items-center py-2 text-white hover:text-[#00E5FF]">
                    <Settings className="h-4 w-4 mr-2" />
                    Painel Admin
                  </Link>
                )}
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <Link href="/login" className="block w-full cyberpunk-btn bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black rounded-md px-3.5 py-2 text-sm font-medium text-center mt-2">
                Entrar
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;