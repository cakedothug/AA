import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Settings, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatDate } from "@/lib/utils";

export default function UserProfile() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  // Dados da aplicação do usuário (se existir)
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/user/applications'],
    enabled: !!user,
  });

  // Dados dos tickets do usuário
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['/api/user/tickets'],
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível fazer logout",
        variant: "destructive",
      });
    }
  };

  const formatRelativeDate = (date: string | Date) => {
    if (!date) return "N/A";
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const getAvatarFallback = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de perfil */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user?.avatar || undefined} alt={user?.username || "Avatar"} />
              <AvatarFallback>{getAvatarFallback(user?.username || "U")}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user?.username}</CardTitle>
            <CardDescription>
              {user?.role === 'admin' ? 'Administrador' : user?.role === 'moderator' ? 'Moderador' : 'Membro'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Entrou {formatRelativeDate(user?.createdAt || new Date())}</span>
            </div>
            <div className="flex items-center justify-center">
              <User className="mr-2 h-4 w-4" />
              <span>Último acesso {formatRelativeDate(user?.lastLogin || new Date())}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link to="/profile/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desconectar
            </Button>
          </CardFooter>
        </Card>

        {/* Área de conteúdo principal */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Candidaturas */}
          <Card>
            <CardHeader>
              <CardTitle>Minhas Candidaturas</CardTitle>
              <CardDescription>Suas candidaturas para a equipe</CardDescription>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-border" />
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app: any) => (
                    <div key={app.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{app.position}</h4>
                          <p className="text-sm text-muted-foreground">
                            Enviada {formatRelativeDate(app.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span 
                            className={`px-2 py-1 rounded text-xs ${
                              app.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : app.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {app.status === 'pending' 
                              ? 'Pendente' 
                              : app.status === 'approved' 
                              ? 'Aprovada' 
                              : 'Recusada'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Você ainda não enviou candidaturas.</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/application">Candidatar-se agora</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Meus Tickets</CardTitle>
              <CardDescription>Seus pedidos de suporte</CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-border" />
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket: any) => (
                    <Link key={ticket.id} to={`/support/ticket/${ticket.id}`}>
                      <div className="border rounded-md p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{ticket.subject}</h4>
                            <p className="text-sm text-muted-foreground">
                              Criado {formatRelativeDate(ticket.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span 
                              className={`px-2 py-1 rounded text-xs ${
                                ticket.status === 'open' 
                                  ? 'bg-green-100 text-green-800' 
                                  : ticket.status === 'processing' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {ticket.status === 'open' 
                                ? 'Aberto' 
                                : ticket.status === 'processing' 
                                ? 'Em processamento' 
                                : 'Fechado'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Você não possui nenhum ticket.</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/support">Criar um ticket</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}