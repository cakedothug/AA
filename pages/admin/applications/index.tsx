import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Loader2, User, Calendar, Clock, FileText } from "lucide-react";
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
}

export default function AdminApplicationsIndex() {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Buscar candidaturas
  const { data: applications, isLoading } = useQuery({
    queryKey: ['/api/admin/applications'],
  });

  // Filtrar por status
  const getFilteredApplications = () => {
    if (!applications?.applications) return [];
    
    if (activeTab === "all") {
      return applications.applications;
    }
    return applications.applications.filter((app: Application) => app.status === activeTab);
  };

  // Formattar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };

  // Formattar hora
  const formatTime = (dateString: string) => {
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

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Candidaturas</h1>
          <p className="text-muted-foreground">
            Gerencie candidaturas para a staff
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="rejected">Recusadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-border" />
            </div>
          ) : getFilteredApplications().length > 0 ? (
            <div className="space-y-4">
              {getFilteredApplications().map((application: Application) => (
                <Card key={application.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        <span>Candidatura para {application.position}</span>
                      </CardTitle>
                      {getStatusBadge(application.status)}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Enviada em {formatDate(application.createdAt)}</span>
                      <Clock className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                      <span>{formatTime(application.createdAt)}</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            {application.user?.avatar ? (
                              <AvatarImage src={application.user.avatar} alt={application.user?.username} />
                            ) : (
                              <AvatarFallback>
                                <User className="h-8 w-8" />
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
                      </div>
                      
                      <div className="flex-1">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Experiência
                            </h4>
                            <p className="text-sm line-clamp-2">{application.experience}</p>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Motivo
                            </h4>
                            <p className="text-sm line-clamp-2">{application.reason}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button asChild variant="outline">
                            <Link to={`/admin/applications/${application.id}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <User className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma candidatura {activeTab !== "all" ? `com status "${activeTab}"` : ""} encontrada.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}