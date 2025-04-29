import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGuidelineSchema, Guideline } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useParams } from "wouter";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { slugify } from "@/lib/utils";
import ReactQuill from "react-quill"; // Importar ReactQuill para editor de texto rico
import "react-quill/dist/quill.snow.css"; // Estilos do ReactQuill

// Estender o schema para adicionar validações adicionais
const formSchema = insertGuidelineSchema.extend({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "O slug deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
  type: z.string().min(1, "O tipo é obrigatório"),
});

export default function AdminGuidelinesEditor() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(params.id);
  
  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      type: "rules", // valor padrão
      order: 0,
      isPublished: true,
    }
  });
  
  // Pré-preencher o slug quando o título muda
  const watchedTitle = form.watch("title");
  
  useEffect(() => {
    if (!isEditing && watchedTitle && !form.getValues("slug")) {
      form.setValue("slug", slugify(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, form, isEditing]);
  
  // Buscar dados da diretriz para edição
  const { data: guidelineData, isLoading: isLoadingGuideline } = useQuery<{guideline: Guideline}>({
    queryKey: ['/api/guidelines', params.id],
    queryFn: () => fetch(`/api/guidelines/${params.id}`).then(res => res.json()),
    enabled: isEditing
  });
  
  // Preencher o formulário com dados existentes quando estiver editando
  useEffect(() => {
    if (isEditing && guidelineData?.guideline) {
      const guideline = guidelineData.guideline;
      
      // Preencher os campos do formulário
      form.reset({
        title: guideline.title,
        slug: guideline.slug,
        content: guideline.content,
        type: guideline.type,
        order: guideline.order,
        isPublished: guideline.isPublished
      });
    }
  }, [guidelineData, form, isEditing]);
  
  // Criar nova diretriz
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest('POST', '/api/admin/guidelines', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Diretriz criada",
        description: "A diretriz foi criada com sucesso",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guidelines'] });
      navigate("/admin/guidelines");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar diretriz",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Atualizar diretriz existente
  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest('PUT', `/api/admin/guidelines/${params.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Diretriz atualizada",
        description: "A diretriz foi atualizada com sucesso",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guidelines'] });
      navigate("/admin/guidelines");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar diretriz",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Lidar com o envio do formulário
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Editar" : "Nova"} Diretriz
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Atualize os detalhes da diretriz existente" 
              : "Crie uma nova diretriz ou regra para o servidor"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/admin/guidelines">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {isEditing && isLoadingGuideline ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-10 w-1/3" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o título da diretriz" {...field} />
                        </FormControl>
                        <FormDescription>
                          O título que será exibido para os usuários
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="slug-da-diretriz" 
                            {...field} 
                            onChange={(e) => {
                              // Sanitizar o slug para apenas letras, números e hífens
                              const sanitizedValue = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, '-')
                                .replace(/-+/g, '-'); // Substitui múltiplos hífens por um único
                              
                              field.onChange(sanitizedValue);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          URL amigável para a diretriz
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: rules, police, safezones" 
                          {...field} 
                          onChange={(e) => {
                            // Sanitizar o tipo para apenas letras minúsculas
                            const sanitizedValue = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '');
                            
                            field.onChange(sanitizedValue);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Categoria da diretriz (ex: rules, police, safezones)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo</FormLabel>
                      <FormControl>
                        <ReactQuill 
                          theme="snow" 
                          value={field.value} 
                          onChange={field.onChange}
                          style={{height: "300px", marginBottom: "50px"}}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem de exibição</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          Número para ordenação (menor = aparece primeiro)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Publicado
                          </FormLabel>
                          <FormDescription>
                            Tornar esta diretriz visível no site
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {createMutation.isPending || updateMutation.isPending 
                      ? "Salvando..." 
                      : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}