import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Guideline } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";

export default function GuidelineDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  
  // Buscar diretriz pelo slug
  const { data, isLoading, error } = useQuery<{guideline: Guideline}>({
    queryKey: ['/api/guidelines/slug', params.slug],
    queryFn: () => fetch(`/api/guidelines/slug/${params.slug}`).then(res => res.json()),
    onError: () => {
      // Redirecionar para a página de diretrizes se não encontrar
      navigate("/guidelines");
    }
  });
  
  const guideline = data?.guideline;

  return (
    <div className="container py-8">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">Erro ao carregar diretriz: {(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : guideline ? (
        <>
          <div className="flex flex-col space-y-2 mb-8">
            <Badge variant="outline" className="self-start">
              {guideline.type.charAt(0).toUpperCase() + guideline.type.slice(1)}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">{guideline.title}</h1>
            <div className="flex items-center text-muted-foreground">
              <CalendarIcon className="mr-1 h-4 w-4" />
              <span>Atualizado em {formatDate(guideline.updatedAt)}</span>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: guideline.content }}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
      
      <Separator className="my-8" />
      
      <div className="flex justify-start">
        <Button variant="outline" asChild>
          <Link to="/guidelines">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Diretrizes
          </Link>
        </Button>
      </div>
    </div>
  );
}