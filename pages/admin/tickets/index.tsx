import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { formatDistance } from "date-fns";
import { pt } from "date-fns/locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { FileText, Clock, MessageCircle, Calendar, User, RefreshCw, ArrowLeft } from "lucide-react";

// Interfaz para tickets
interface AdminTicket {
  id: number;
  userId: number;
  subject: string;
  status: "open" | "processing" | "closed";
  priority: "low" | "medium" | "high";
  department: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: number | null;
  user?: {
    id: number;
    username: string;
    discordUsername?: string;
    avatar?: string;
  } | null;
}

export default function AdminTicketsIndex() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Buscar tickets
  const { data, isLoading, error } = useQuery<{tickets: AdminTicket[]}>({
    queryKey: ['/api/admin/tickets', activeTab],
    queryFn: () => {
      const url = activeTab !== "all" 
        ? `/api/admin/tickets?status=${activeTab}` 
        : '/api/admin/tickets';
      return fetch(url).then(res => res.json());
    }
  });
  
  // Função para pegar a cor do badge baseado no status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return "default";
      case 'processing':
        return "outline";
      case 'closed':
        return "secondary";
      default:
        return "default";
    }
  };
  
  // Função para traduzir o status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return "Aberto";
      case 'processing':
        return "Em Processamento";
      case 'closed':
        return "Fechado";
      default:
        return status;
    }
  };
  
  // Função para traduzir a prioridade
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low':
        return "Baixa";
      case 'medium':
        return "Média";
      case 'high':
        return "Alta";
      default:
        return priority;
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tickets de Suporte</h1>
          <p className="text-muted-foreground">
            Gerencie todos os tickets de suporte de usuários
          </p>
        </div>
        <Button onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Dashboard
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="open">Abertos</TabsTrigger>
          <TabsTrigger value="processing">Em Processamento</TabsTrigger>
          <TabsTrigger value="closed">Fechados</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">Erro ao carregar tickets: {(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {data?.tickets && data.tickets.length > 0 ? (
            <div className="space-y-4">
              {data.tickets.map(ticket => (
                <Card key={ticket.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-4 md:p-6 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">
                            <Link to={`/admin/tickets/${ticket.id}`} className="hover:underline">
                              {ticket.subject}
                            </Link>
                          </h3>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground flex-wrap gap-2">
                            <Badge variant={getStatusBadgeVariant(ticket.status)}>
                              {getStatusText(ticket.status)}
                            </Badge>
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>
                                {formatDistance(new Date(ticket.createdAt), new Date(), { 
                                  addSuffix: true,
                                  locale: pt
                                })}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <User className="h-3.5 w-3.5 mr-1" />
                              <span>{ticket.user?.username || "Usuário"}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <span>Prioridade: {getPriorityText(ticket.priority)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                        >
                          <Link to={`/admin/tickets/${ticket.id}`}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Visualizar Ticket
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted border-t md:border-t-0 md:border-l flex flex-col justify-between w-full md:w-60">
                      <div>
                        <p className="text-sm font-medium">Departamento</p>
                        <p className="text-sm text-muted-foreground">{ticket.department}</p>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium">Status</p>
                        <div className="flex items-center mt-1">
                          <Badge variant={getStatusBadgeVariant(ticket.status)}>
                            {getStatusText(ticket.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium">Atribuído a</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.assignedTo ? "Admin" : "Não atribuído"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center justify-center p-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum Ticket Encontrado</h3>
                  <p className="text-muted-foreground">
                    Não há tickets {activeTab !== "all" ? `com status "${getStatusText(activeTab)}"` : ""} no momento.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}