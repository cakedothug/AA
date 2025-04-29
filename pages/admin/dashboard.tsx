import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, Users, Newspaper, Settings, User, MessageCircle, Image, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Estatísticas gerais
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  // Estatísticas do servidor
  const { data: serverStats, isLoading: serverStatsLoading } = useQuery({
    queryKey: ['/api/admin/server-stats'],
  });

  // Aplicações recentes
  const { data: recentApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/admin/applications/recent'],
  });

  // Estatísticas de contagem
  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ['/api/admin/counts'],
  });

  // Renderizar com dados de fallback se o servidor não retornar dados
  const dashboardStats = stats || {
    totalUsers: 0,
    totalNews: 0,
    totalApplications: 0,
    totalTickets: 0,
    recentUsers: 0,
    recentNews: 0,
    pendingApplications: 0,
    openTickets: 0,
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.username}. Gerencie o conteúdo do site.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild variant="outline">
            <Link to="/">
              Visualizar Site
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Totais
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                dashboardStats.totalUsers
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats.recentUsers} nos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notícias
            </CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                dashboardStats.totalNews
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats.recentNews} nos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Candidaturas
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                dashboardStats.totalApplications
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.pendingApplications} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tickets
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                dashboardStats.totalTickets
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.openTickets} abertos
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="server">Servidor</TabsTrigger>
          <TabsTrigger value="applications">Candidaturas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
                <CardDescription>Visão geral das atividades do site</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {statsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-10 w-10 animate-spin text-border" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart 
                      data={counts || []}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" name="Usuários" fill="#8884d8" />
                      <Bar dataKey="news" name="Notícias" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesse as funcionalidades principais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full justify-start">
                  <Link to="/admin/news">
                    <Newspaper className="mr-2 h-4 w-4" />
                    Gerenciar Notícias
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link to="/admin/guidelines">
                    <FileText className="mr-2 h-4 w-4" />
                    Gerenciar Regras
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link to="/admin/tickets">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Gerenciar Tickets
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link to="/admin/staff">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar Equipe
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link to="/admin/applications">
                    <User className="mr-2 h-4 w-4" />
                    Ver Candidaturas
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link to="/admin/media">
                    <Image className="mr-2 h-4 w-4" />
                    Galeria de Mídia
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link to="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="server" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Servidor</CardTitle>
              <CardDescription>Dados de jogadores online nos últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {serverStatsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-10 w-10 animate-spin text-border" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={serverStats || []}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="players" 
                      name="Jogadores" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidaturas Recentes</CardTitle>
              <CardDescription>Últimas candidaturas enviadas</CardDescription>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-border" />
                </div>
              ) : recentApplications && recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{app.position}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.user.username} - {formatDate(app.createdAt)}
                        </p>
                      </div>
                      <div className="ml-auto">
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
                      <Button asChild variant="outline" size="sm" className="ml-2">
                        <Link to={`/admin/applications/${app.id}`}>
                          Ver
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nenhuma candidatura recente encontrada.</p>
                </div>
              )}
              <div className="text-center mt-4">
                <Button asChild variant="outline">
                  <Link to="/admin/applications">
                    Ver Todas as Candidaturas
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}