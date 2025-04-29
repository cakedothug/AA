import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, ArrowLeft, Calendar, User, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface ApplicationUser {
  id: number;
  username: string;
  discordUsername?: string;
  avatar?: string;
}

interface Application {
  id: number;
  userId: number;
  position: string;
  experience: string;
  reason: string;
  additionalInfo: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  reviewedBy?: number;
  createdAt: string;
  updatedAt: string;
  user?: ApplicationUser;
  reviewer?: {
    id: number;
    username: string;
  };
}

export default function AdminApplicationView() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Buscar candidatura
  const { data: application, isLoading } = useQuery({
    queryKey: ['/api/admin/applications', id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/applications/${id}`);
      const data = await res.json();
      if (data.application) {
        setNotes(data.application.adminNotes || "");
        return data.application;
      }
      return null;
    },
  });

  // Mutation para atualizar notas
  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      return await apiRequest("PATCH", `/api/admin/applications/${id}/notes`, { notes });
    },
    onSuccess: () => {
      toast({
        title: "Notas atualizadas",
        description: "As notas foram atualizadas com sucesso"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications', id] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar notas",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para aprovar candidatura
  const approveApplicationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/admin/applications/${id}/approve`, { notes });
    },
    onSuccess: () => {
      toast({
        title: "Candidatura aprovada",
        description: "A candidatura foi aprovada com sucesso"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
      setShowApproveDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao aprovar candidatura",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para rejeitar candidatura
  const rejectApplicationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/admin/applications/${id}/reject`, { notes });
    },
    onSuccess: () => {
      toast({
        title: "Candidatura rejeitada",
        description: "A candidatura foi rejeitada com sucesso"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
      setShowRejectDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao rejeitar candidatura",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Formattar data
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };

  // Formattar hora
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "HH:mm", { locale: pt });
  };

  // Obter badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Aprovada</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Recusada</Badge>;
      default:
        return null;
    }
  };

  // Salvar notas
  const handleSaveNotes = async () => {
    await updateNotesMutation.mutateAsync(notes);
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-border" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container py-10">
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Candidatura não encontrada.
            </p>
            <Button onClick={() => setLocation("/admin/applications")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para listagem
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button 
          variant="outline" 
          className="mb-4"
          onClick={() => setLocation("/admin/applications")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para listagem
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Candidatura #{application.id}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                {application.position}
              </p>
              {getStatusBadge(application.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Candidatura</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Enviada em {formatDate(application.createdAt)}</span>
                <Clock className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                <span>{formatTime(application.createdAt)}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-2">Experiência Prévia</h3>
                <p className="text-sm whitespace-pre-line">{application.experience}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-lg mb-2">Motivo</h3>
                <p className="text-sm whitespace-pre-line">{application.reason}</p>
              </div>
              
              {application.additionalInfo && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-lg mb-2">Informações Adicionais</h3>
                    <p className="text-sm whitespace-pre-line">{application.additionalInfo}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas Administrativas</CardTitle>
              <CardDescription>
                Adicione notas para revisão interna
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Adicione notas administrativas sobre esta candidatura aqui..."
                className="min-h-32"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={application.status !== "pending"}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={handleSaveNotes}
                disabled={application.status !== "pending" || updateNotesMutation.isPending}
              >
                {updateNotesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Notas
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  {application.user?.avatar ? (
                    <AvatarImage src={application.user.avatar} alt={application.user?.username} />
                  ) : (
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold">{application.user?.username}</p>
                  {application.user?.discordUsername && (
                    <p className="text-sm text-muted-foreground">
                      Discord: {application.user.discordUsername}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {application.status !== "pending" ? (
            <Card>
              <CardHeader>
                <CardTitle>Status da Candidatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Status:</p>
                    {application.status === "approved" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aprovada</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Recusada</Badge>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Revisado por:</p>
                    <p className="text-sm">{application.reviewer?.username || "Admin"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Atualizado em:</p>
                    <p className="text-sm">{formatDate(application.updatedAt)} às {formatTime(application.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
                <CardDescription>
                  Aprovar ou recusar esta candidatura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full"
                  onClick={() => setShowApproveDialog(true)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprovar Candidatura
                </Button>
                
                <Button 
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Recusar Candidatura
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de confirmação de aprovação */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar Candidatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar esta candidatura? 
              O candidato será notificado sobre a aprovação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => approveApplicationMutation.mutate()}
              disabled={approveApplicationMutation.isPending}
            >
              {approveApplicationMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar Aprovação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação de rejeição */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recusar Candidatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja recusar esta candidatura?
              O candidato será notificado sobre a recusa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => rejectApplicationMutation.mutate()}
              disabled={rejectApplicationMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {rejectApplicationMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar Recusa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}