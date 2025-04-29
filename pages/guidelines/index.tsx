import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Guideline } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

export default function GuidelinesIndex() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("rules");
  
  // Buscar todas as diretrizes
  const { data, isLoading, error } = useQuery<{guidelines: Guideline[]}>({
    queryKey: ['/api/guidelines'],
    queryFn: () => fetch('/api/guidelines').then(res => res.json())
  });
  
  // Agrupar diretrizes por tipo
  const guidelinesByType = data?.guidelines?.reduce((acc, guideline) => {
    if (!acc[guideline.type]) {
      acc[guideline.type] = [];
    }
    acc[guideline.type].push(guideline);
    return acc;
  }, {} as Record<string, Guideline[]>) || {};
  
  // Obter todos os tipos únicos
  const types = Object.keys(guidelinesByType);
  
  // Definir o tipo padrão se não houver diretrizes do tipo selecionado
  useEffect(() => {
    if (types.length > 0 && !types.includes(activeTab)) {
      setActiveTab(types[0]);
    }
  }, [types, activeTab]);

  return (
    <div className="container py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Regras e Diretrizes</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Conheça as regras do servidor Tokyo Edge Roleplay
        </p>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-60 w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">Erro ao carregar diretrizes: {(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {types.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhuma diretriz encontrada. Volte mais tarde.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                {types.map(type => (
                  <TabsTrigger key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {types.map(type => (
                <TabsContent key={type} value={type} className="space-y-6">
                  {guidelinesByType[type]
                    .sort((a, b) => a.order - b.order)
                    .map(guideline => (
                      <Card key={guideline.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl">{guideline.title}</CardTitle>
                            <Badge variant="outline">{guideline.type}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div 
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: guideline.content }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </>
      )}
      
      <Separator className="my-8" />
      
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link to="/">
            <FileText className="mr-2 h-4 w-4" />
            Voltar para Página Inicial
          </Link>
        </Button>
      </div>
    </div>
  );
}