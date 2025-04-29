import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Ticket, TicketReply } from "@shared/schema";
import { formatDate, formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Clock, Check, ShieldAlert, FileUp } from "lucide-react";

export default function TicketView() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [replyText, setReplyText] = useState("");
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  
  // Buscar ticket e respostas
  const { data, isLoading, error } = useQuery<{ticket: Ticket, replies: TicketReply[]}>({
    queryKey: ['/api/user/tickets', id],
    queryFn: () => fetch(`/api/user/tickets/${id}`).then(res => res.json())
  });
  
  // Mutation para enviar resposta
  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("POST", `/api/user/tickets/${id}/reply`, { message });
    },
    onSuccess: () => {
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso"
      });
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ['/api/user/tickets', id] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar resposta",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Mutation para fechar ticket
  const closeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/user/tickets/${id}/close`, {});
    },
    onSuccess: () => {
      toast({
        title: "Ticket fechado",
        description: "O ticket foi fechado com sucesso"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/tickets', id] });
      setShowCloseDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao fechar ticket",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSendReply = () => {
    if (replyText.trim() !== "") {
      replyMutation.mutate(replyText);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Carregando...</h1>
        </div>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="container py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Erro</h1>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <ShieldAlert className="h-12 w-12 mx-auto text-destructive" />
              <h2 className="text-xl font-semibold mt-4">Erro ao carregar ticket</h2>
              <p className="text-muted-foreground mt-2">
                Não foi possível carregar os detalhes do ticket. Tente novamente mais tarde.
              </p>
              <Button className="mt-4" onClick={() => navigate('/profile')}>
                Voltar para o perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { ticket, replies } = data;
  const isClosed = ticket.status === 'closed';
  
  return (
    <div className="container py-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">{ticket.subject}</h1>
          <Badge variant={
            ticket.status === 'open' 
              ? 'default' 
              : ticket.status === 'processing' 
              ? 'secondary' 
              : 'outline'
          }>
            {ticket.status === 'open' 
              ? 'Aberto' 
              : ticket.status === 'processing' 
              ? 'Em processamento' 
              : 'Fechado'}
          </Badge>
        </div>
        
        {!isClosed && (
          <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-4 lg:mt-0">
                <Check className="mr-2 h-4 w-4" />
                Marcar como resolvido
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Fechar ticket?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação marcará o ticket como resolvido. Você poderá visualizar o histórico, mas não poderá mais enviar mensagens neste ticket.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => closeMutation.mutate()}>
                  {closeMutation.isPending ? "Fechando..." : "Sim, fechar ticket"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mensagem Original */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">Você</CardTitle>
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
                          <AvatarFallback>{
                            reply.isStaff 
                              ? "S" 
                              : reply.user?.username?.charAt(0) || "U"
                          }</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <CardTitle className="text-base flex items-center">
                          {reply.user?.username || "Usuário"}
                          {reply.isStaff && (
                            <Badge variant="secondary" className="ml-2 text-xs">Staff</Badge>
                          )}
                          {reply.isSystemMessage && (
                            <Badge variant="outline" className="ml-2 text-xs">Sistema</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {formatDate(reply.createdAt)} às {formatTime(reply.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line">{reply.message}</div>
                    
                    {reply.attachments && reply.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Anexos:</h4>
                        <div className="flex flex-wrap gap-2">
                          {reply.attachments.map((attachment, i) => (
                            <a 
                              key={i}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-2 border rounded text-sm hover:bg-accent"
                            >
                              <FileUp className="h-4 w-4 mr-2" />
                              {attachment.filename}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Formulário de resposta */}
          {!isClosed && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Responder ao ticket</CardTitle>
                <CardDescription>
                  Escreva uma resposta para o suporte
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
              <CardFooter className="justify-between">
                <div>
                  <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">
                    <FileUp className="mr-2 h-4 w-4" />
                    Anexar arquivo (em breve)
                  </Button>
                </div>
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
                <p className="text-sm font-medium">Categoria</p>
                <p className="text-muted-foreground">{ticket.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Prioridade</p>
                <p className="text-muted-foreground capitalize">
                  {ticket.priority === 'low' ? 'Baixa' : 
                   ticket.priority === 'medium' ? 'Média' : 'Alta'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant={
                    ticket.status === 'open' 
                      ? 'default' 
                      : ticket.status === 'processing' 
                      ? 'secondary' 
                      : 'outline'
                  }>
                    {ticket.status === 'open' 
                      ? 'Aberto' 
                      : ticket.status === 'processing' 
                      ? 'Em processamento' 
                      : 'Fechado'}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Data de abertura</p>
                <p className="text-muted-foreground">
                  {formatDate(ticket.createdAt)} às {formatTime(ticket.createdAt)}
                </p>
              </div>
              {ticket.closedAt && (
                <div>
                  <p className="text-sm font-medium">Data de fechamento</p>
                  <p className="text-muted-foreground">
                    {formatDate(ticket.closedAt)} às {formatTime(ticket.closedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p>• Mantenha suas respostas claras e objetivas</p>
                <p>• Forneça todos os detalhes relevantes</p>
                <p>• Seja paciente, nossa equipe responderá assim que possível</p>
                <p>• Verifique este ticket regularmente</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}