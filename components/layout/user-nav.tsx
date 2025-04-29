import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, FileText, Shield, Server } from "lucide-react";
import { Link } from "wouter";

export function UserNav() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  // Obter as iniciais do nome de usuário
  const getInitials = (name: string) => {
    return name
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isAdmin = user.role === 'admin';
  const isStaff = ['admin', 'moderator', 'support'].includes(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full border border-primary/30 hover:border-primary/60 hover:bg-primary/10"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || undefined} alt={user.username} />
            <AvatarFallback className="bg-gradient-to-tr from-secondary to-primary text-primary-foreground">
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-black/95 backdrop-blur-md border border-primary/20" 
        align="end" 
        forceMount
      >
        <DropdownMenuLabel className="font-normal border-b border-primary/10 pb-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-primary">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <div className="py-1">
          <DropdownMenuItem asChild className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary">
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary">
            <Link href="/application">
              <FileText className="mr-2 h-4 w-4" />
              <span>Formulário Staff</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary">
            <a href="fivem://connect/45.89.30.198">
              <Server className="mr-2 h-4 w-4" />
              <span>Conectar ao Servidor</span>
            </a>
          </DropdownMenuItem>
        </div>
        
        {/* Links para staff/admin */}
        {isStaff && (
          <>
            <DropdownMenuSeparator className="bg-primary/10" />
            <DropdownMenuLabel className="font-normal text-xs text-primary/70 pb-1 pt-2">
              Administração
            </DropdownMenuLabel>
            <div className="py-1">
              <DropdownMenuItem asChild className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary">
                <Link href="/admin/dashboard">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Painel Admin</span>
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary">
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </div>
          </>
        )}
        
        <DropdownMenuSeparator className="bg-primary/10" />
        <div className="py-1">
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="hover:bg-destructive/20 hover:text-destructive focus:bg-destructive/20 focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{logoutMutation.isPending ? "Saindo..." : "Sair"}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}