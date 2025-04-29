import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { ArrowLeft, Clock, Calendar, User, Send, CheckCircle, UserCheck, XCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Interface para tickets
interface Ticket {
  id: number;
  userId: number;
  subject: string;
  status: "open" | "processing" | "closed";
  priority: "low" | "medium" | "high";
  department: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: number | null;
  closedAt: string | null;
  closedBy: number | null;
  user?: {
    id: number;
    username: string;
    discordUsername?: string;
    avatar?: string;
  } | null;
}

// Interface para respostas de ticket
interface TicketReply {
  id: number;
  ticketId: number;
  userId: number;
  message: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    discordUsername?: string;
    avatar?: string;
    role: string;
  } | null;
}

export default function AdminTicketView() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [replyText, setReplyText] = useState("");
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  
  // Buscar ticket e respostas
  const { data, isLoading, error } = useQuery<{ticket: Ticket, replies: TicketReply[]}>({
    queryKey: ['/api/admin/tickets', id],
    queryFn: () => fetch(`/api/admin/tickets/${id}`).then(res => res.json())
  });
  
  // Mutation para enviar resposta
  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("POST", `/api/admin/tickets/${id}/reply`, { message });
    },
    onSuccess: () => {
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso"
      });
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets', id] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar resposta",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Mutation para atribuir ticket a mim
  const assignMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/admin/tickets/${id}/assign`, {});
    },
    onSuccess: () => {
      toast({
        title: "Ticket atribuído",
        description: "O ticket foi atribuído a você"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets', id] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atribuir ticket",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Mutation para fechar ticket
  const closeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/admin/tickets/${id}/close`, {});
    },
    onSuccess: () => {
      toast({
        title: "Ticket fechado",
        description: "O ticket foi fechado com sucesso"
      });
      setShowCloseDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets', id] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao fechar ticket",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Função para enviar resposta
  const handleSendReply = () => {
    if (replyText.trim() === "") return;
    replyMutation.mutate(replyText);
  };
  
  // Função para formatar data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };
  
  // Função para formatar hora
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: pt });
  };
  
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
  
  if (isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="container py-10">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate("/admin/tickets")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para listagem
        </Button>
        
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message || "Não foi possível carregar o ticket. Tente novamente mais tarde."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const { ticket, replies } = data;
  
  return (
    <div className="container py-10">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate("/admin/tickets")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para listagem
      </Button>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{ticket.subject}</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={getStatusBadgeVariant(ticket.status)}>
            {getStatusText(ticket.status)}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-3.5 w-3.5" />
            <span>{formatDate(ticket.createdAt)}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>{formatTime(ticket.createdAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mensagem Original */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  {ticket.user?.avatar ? (
                    <AvatarImage src={ticket.user.avatar} alt={ticket.user.username} />
                  ) : (
                    <AvatarFallback>{ticket.user?.username?.charAt(0) || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle className="text-base">{ticket.user?.username || "Usuário"}</CardTitle>
                  <CardDescription className="text-xs">
                    {formatDate(ticket.createdAt)} às {formatTime(ticket.createdAt)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">{ticket.message}</div>
            </CardContent>
          </Card>
          
          {/* Respostas */}
          {replies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Respostas</h2>
              {replies.map(reply => (
                <Card key={reply.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        {reply.user?.avatar ? (
                          <AvatarImage src={reply.user.avatar} alt={reply.user.username} />
                        ) : (
                          <AvatarFallback>{reply.user?.username?.charAt(0) || "U"}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <CardTitle className="text-base">{reply.user?.username || "Usuário"}</CardTitle>
                          {reply.user?.role === "admin" && (
                            <Badge variant="secondary" className="ml-2 text-xs">ADMIN</Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          {formatDate(reply.createdAt)} às {formatTime(reply.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line">{reply.message}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Enviar resposta (apenas se o ticket não estiver fechado) */}
          {ticket.status !== "closed" && (
            <Card>
              <CardHeader>
                <CardTitle>Responder</CardTitle>
                <CardDescription>
                  Envie uma resposta para o usuário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Escreva sua resposta aqui..." 
                  className="min-h-[120px]"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  onClick={handleSendReply} 
                  disabled={replyText.trim() === "" || replyMutation.isPending}
                >
                  {replyMutation.isPending ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Resposta
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Informações e ações */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Usuário</p>
                <div className="flex items-center mt-1">
                  <Avatar className="h-6 w-6 mr-2">
                    {ticket.user?.avatar ? (
                      <AvatarImage src={ticket.user.avatar} alt={ticket.user.username} />
                    ) : (
                      <AvatarFallback>{ticket.user?.username?.charAt(0) || "U"}</AvatarFallback>
                    )}
                  </Avatar>
                  <span>{ticket.user?.username || "Usuário"}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Departamento</p>
                <p className="text-sm text-muted-foreground">{ticket.department}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Prioridade</p>
                <p className="text-sm text-muted-foreground">{getPriorityText(ticket.priority)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Status</p>
                <div className="flex items-center mt-1">
                  <Badge variant={getStatusBadgeVariant(ticket.status)}>
                    {getStatusText(ticket.status)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Atribuído a</p>
                <p className="text-sm text-muted-foreground">
                  {ticket.assignedTo ? "Admin" : "Não atribuído"}
                </p>
              </div>
              
              {ticket.closedAt && (
                <div>
                  <p className="text-sm font-medium">Fechado em</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ticket.closedAt)} às {formatTime(ticket.closedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Ações do Admin (apenas se o ticket não estiver fechado) */}
          {ticket.status !== "closed" && (
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => assignMutation.mutate()}
                  disabled={assignMutation.isPending || ticket.assignedTo !== null}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  {assignMutation.isPending ? "Atribuindo..." : "Atribuir a mim"}
                </Button>
                
                <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      variant="secondary"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Fechar Ticket
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Fechar ticket</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja fechar este ticket? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => closeMutation.mutate()}
                        disabled={closeMutation.isPending}
                      >
                        {closeMutation.isPending ? "Fechando..." : "Fechar Ticket"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}