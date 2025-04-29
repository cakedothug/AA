import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Guideline } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarIcon, FileEdit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

export default function AdminGuidelinesIndex() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<string>("all");
  
  // Buscar diretrizes
  const { data, isLoading, error } = useQuery<{guidelines: Guideline[]}>({
    queryKey: ['/api/guidelines', filter],
    queryFn: () => {
      const url = filter && filter !== "all"
        ? `/api/guidelines?type=${filter}&publishedOnly=false`
        : '/api/guidelines?publishedOnly=false';
      return fetch(url).then(res => res.json());
    }
  });
  
  // Excluir diretriz
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/guidelines/${id}`);
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guidelines'] });
      toast({
        title: "Diretriz excluída",
        description: "A diretriz foi excluída com sucesso",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir diretriz",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta diretriz? Esta ação não pode ser desfeita.")) {
      deleteMutation.mutate(id);
    }
  };
  
  // Obter tipos únicos para filtro
  const uniqueTypes = data?.guidelines 
    ? Array.from(new Set(data.guidelines.map(g => g.type)))
    : [];

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Diretrizes e Regras</h1>
          <p className="text-muted-foreground">
            Gerencie as regras, diretrizes e protocolos do servidor
          </p>
        </div>
        <Button onClick={() => navigate("/admin/guidelines/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Diretriz
        </Button>
      </div>
      
      <div className="mb-6">
        <Select value={filter} onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
            <p className="text-center text-red-500">Erro ao carregar diretrizes: {(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {data?.guidelines && data.guidelines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.guidelines.map(guideline => (
                <Card key={guideline.id} className={!guideline.isPublished ? "opacity-60" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{guideline.title}</CardTitle>
                      <Badge variant={guideline.isPublished ? "default" : "outline"}>
                        {guideline.isPublished ? "Publicado" : "Rascunho"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-2">{guideline.type}</Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {new Date(guideline.updatedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 text-sm">
                      {guideline.content.length > 150 
                        ? guideline.content.substring(0, 150) + "..." 
                        : guideline.content}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(guideline.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <Link to={`/admin/guidelines/edit/${guideline.id}`}>
                          <FileEdit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhuma diretriz encontrada. Crie uma nova diretriz clicando no botão acima.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}