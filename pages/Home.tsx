import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Users, FileText, Server, CalendarDays } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  
  const { data: newsData, isLoading: isLoadingNews } = useQuery({
    queryKey: ["/api/news/featured"],
    queryFn: async () => {
      const res = await fetch("/api/news/featured");
      if (!res.ok) throw new Error("Falha ao carregar notícias em destaque");
      return res.json();
    },
    enabled: true,
  });

  const { data: serverStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/server/stats"],
    queryFn: async () => {
      const res = await fetch("/api/server/stats");
      if (!res.ok) throw new Error("Falha ao carregar estatísticas do servidor");
      return res.json();
    },
    enabled: true,
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-background/90 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Bem-vindo ao Tokyo Edge Roleplay
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Uma experiência única de roleplay no universo de GTA V. Viva sua vida como quiser em uma comunidade brasileira vibrante e imersiva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <a href="https://discord.gg/tokyoedgerp" target="_blank" rel="noopener noreferrer">
                  Junte-se ao nosso Discord
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/application">
                  Aplicar para Staff
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Server Info */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Jogadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isLoadingStats ? "..." : serverStats?.players || "0"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Jogadores online agora
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Regras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">
                  Regras atualizadas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Server className="h-5 w-5 mr-2 text-primary" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">Online</p>
                <p className="text-sm text-muted-foreground">
                  Servidor operando normalmente
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                  Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">
                  Próximos eventos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* News & Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="news" className="w-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Novidades e Conteúdo</h2>
              <TabsList>
                <TabsTrigger value="news">Notícias</TabsTrigger>
                <TabsTrigger value="updates">Atualizações</TabsTrigger>
                <TabsTrigger value="gallery">Galeria</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="news">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingNews ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="h-48 bg-muted animate-pulse" />
                      <CardHeader>
                        <div className="h-7 bg-muted animate-pulse rounded-md w-3/4" />
                        <div className="h-4 bg-muted animate-pulse rounded-md w-1/2 mt-2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-muted animate-pulse rounded-md w-full mb-2" />
                        <div className="h-4 bg-muted animate-pulse rounded-md w-full mb-2" />
                        <div className="h-4 bg-muted animate-pulse rounded-md w-3/4" />
                      </CardContent>
                    </Card>
                  ))
                ) : newsData && newsData.length > 0 ? (
                  newsData.map((article) => (
                    <Card key={article.id} className="overflow-hidden">
                      <div 
                        className="h-48 bg-cover bg-center" 
                        style={{ backgroundImage: `url(${article.image || '/placeholder-news.jpg'})` }} 
                      />
                      <CardHeader>
                        <CardTitle>{article.title}</CardTitle>
                        <CardDescription>
                          {new Date(article.createdAt).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3">{article.summary}</p>
                        <Button variant="link" asChild className="p-0 h-auto mt-2">
                          <Link href={`/news/${article.slug}`}>
                            Ler mais
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-muted-foreground">Nenhuma notícia encontrada</p>
                  </div>
                )}
              </div>
              
              {newsData && newsData.length > 0 && (
                <div className="flex justify-center mt-8">
                  <Button variant="outline" asChild>
                    <Link href="/news">
                      Ver todas as notícias
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="updates">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-4">Últimas Atualizações</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-semibold">Patch 2.4.1</h4>
                      <span className="text-sm text-muted-foreground">28/04/2025</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Correções de bugs no sistema de trabalho e melhorias na estabilidade geral do servidor.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-semibold">Atualização de Conteúdo: Novo Bairro</h4>
                      <span className="text-sm text-muted-foreground">15/04/2025</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Adicionado novo bairro residencial com apartamentos de luxo e novos negócios.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-semibold">Sistema de Empregos Atualizado</h4>
                      <span className="text-sm text-muted-foreground">05/04/2025</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Novos empregos disponíveis na cidade, incluindo entregador, taxista e segurança.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="gallery">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={`/placeholder-gallery-${(i % 4) + 1}.jpg`} 
                      alt="Gallery image" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-8">
                <Button variant="outline" asChild>
                  <Link href="/gallery">
                    Explorar galeria completa
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para fazer parte dessa história?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Seja um jogador, um colaborador ou apenas um admirador da comunidade, 
            temos um lugar para você no Tokyo Edge Roleplay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="fivem://connect/45.89.30.198" className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                <span>Conectar ao Servidor</span>
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://discord.gg/tokyoedgerp" target="_blank" rel="noopener noreferrer">
                Entrar no Discord
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}