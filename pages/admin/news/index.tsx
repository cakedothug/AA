import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, Edit, Trash2, Plus, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// Validação com Zod
const newsSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "O slug deve ter pelo menos 3 caracteres").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido (use apenas letras, números e hífens)"),
  excerpt: z.string().min(10, "O resumo deve ter pelo menos 10 caracteres"),
  content: z.string().min(20, "O conteúdo deve ter pelo menos 20 caracteres"),
  coverImage: z.string().url("URL da imagem inválida").or(z.string().length(0)),
  categoryId: z.number().nullable(),
  published: z.boolean().default(true),
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  categoryId: number | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  author?: {
    id: number;
    username: string;
    avatar: string | null;
  };
}

export default function AdminNewsManager() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<NewsArticle | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);

  // Buscar categorias
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/news/categories'],
  });

  // Buscar notícias
  const { data: newsArticles, isLoading: newsLoading } = useQuery({
    queryKey: ['/api/admin/news'],
  });

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      categoryId: null,
      published: true,
    },
  });

  // Mutation para criar notícia
  const createNewsMutation = useMutation({
    mutationFn: async (data: NewsFormValues) => {
      return await apiRequest("POST", "/api/admin/news", data);
    },
    onSuccess: () => {
      toast({
        title: "Notícia adicionada",
        description: "Notícia adicionada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      queryClient.invalidateQueries({ queryKey: ['/api/news/featured'] });
      setIsEditing(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar notícia",
        description: error.message || "Ocorreu um erro ao adicionar a notícia",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar notícia
  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: NewsFormValues }) => {
      return await apiRequest("PUT", `/api/admin/news/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Notícia atualizada",
        description: "Notícia atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      queryClient.invalidateQueries({ queryKey: ['/api/news/featured'] });
      setIsEditing(false);
      setCurrentArticle(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar notícia",
        description: error.message || "Ocorreu um erro ao atualizar a notícia",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar notícia
  const deleteNewsMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/news/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Notícia removida",
        description: "Notícia removida com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      queryClient.invalidateQueries({ queryKey: ['/api/news/featured'] });
      setIsDeleteDialogOpen(false);
      setArticleToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover notícia",
        description: error.message || "Ocorreu um erro ao remover a notícia",
        variant: "destructive",
      });
    },
  });

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Form submit handler
  const onSubmit = async (data: NewsFormValues) => {
    if (currentArticle && currentArticle.id) {
      // Update
      await updateNewsMutation.mutateAsync({ id: currentArticle.id, data });
    } else {
      // Create
      await createNewsMutation.mutateAsync(data);
    }
  };

  // Handle title change - auto generate slug if it's a new article
  const handleTitleChange = (title: string) => {
    form.setValue("title", title);
    
    // Only auto-generate slug for new articles or if the slug field is empty
    if (!currentArticle || !form.getValues("slug")) {
      const slug = generateSlug(title);
      form.setValue("slug", slug);
    }
  };

  // Initialize form with article data
  const resetFormWithArticle = (article: NewsArticle) => {
    form.reset({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage || "",
      categoryId: article.categoryId,
      published: article.published,
    });
  };

  // New article
  const handleNewArticle = () => {
    setCurrentArticle(null);
    form.reset({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      categoryId: null,
      published: true,
    });
    setIsEditing(true);
  };

  // Edit article
  const handleEditArticle = (article: NewsArticle) => {
    setCurrentArticle(article);
    resetFormWithArticle(article);
    setIsEditing(true);
  };

  // Delete article
  const handleDeleteArticle = (id: number) => {
    setArticleToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDeleteArticle = async () => {
    if (articleToDelete !== null) {
      await deleteNewsMutation.mutateAsync(articleToDelete);
    }
  };

  // Format date
  const formatArticleDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Notícias</h1>
          <p className="text-muted-foreground">
            Adicione, edite ou remova notícias do site
          </p>
        </div>
        <Button onClick={handleNewArticle}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Notícia
        </Button>
      </div>

      {/* Lista de notícias */}
      <div className="space-y-6">
        {newsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-border" />
          </div>
        ) : newsArticles && newsArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {newsArticles.map((article: NewsArticle) => (
              <Card key={article.id} className={!article.published ? "opacity-70" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl flex items-center">
                        {article.title}
                        {!article.published && (
                          <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                            Rascunho
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {article.category?.name && (
                          <span 
                            className="inline-block mr-2 px-2 py-0.5 rounded text-xs"
                            style={{ backgroundColor: article.category.color, color: "#fff" }}
                          >
                            {article.category.name}
                          </span>
                        )}
                        <span>
                          Publicado em {formatArticleDate(article.createdAt)}
                        </span>
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditArticle(article)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteArticle(article.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    {article.coverImage && (
                      <div className="flex-shrink-0">
                        <img 
                          src={article.coverImage} 
                          alt={article.title} 
                          className="w-32 h-24 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-3">
                  <div className="text-sm text-muted-foreground">
                    Por: {article.author?.username || "Admin"}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/news/${article.slug}`} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Visualizar
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-10">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Nenhuma notícia publicada ainda. Clique no botão abaixo para adicionar sua primeira notícia.
              </p>
              <Button onClick={handleNewArticle}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Notícia
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de edição/criação */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentArticle ? "Editar Notícia" : "Nova Notícia"}
            </DialogTitle>
            <DialogDescription>
              {currentArticle 
                ? "Edite as informações da notícia abaixo."
                : "Preencha os campos para criar uma nova notícia."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        onChange={(e) => handleTitleChange(e.target.value)}
                      />
                    </FormControl>
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
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      URL da notícia (somente letras, números e hífens)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sem categoria</SelectItem>
                          {!categoriesLoading && categories?.categories && categories.categories.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Status</FormLabel>
                        <FormDescription>
                          Publicar esta notícia?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem de Capa (URL)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://exemplo.com/imagem.jpg" />
                    </FormControl>
                    <FormDescription>
                      URL para uma imagem de capa (deixe em branco para não usar)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resumo</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={2}
                        placeholder="Um breve resumo da notícia" 
                      />
                    </FormControl>
                    <FormDescription>
                      Uma breve descrição da notícia que será exibida na página inicial
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
                      <Textarea 
                        {...field} 
                        rows={10}
                        placeholder="Conteúdo completo da notícia..." 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentArticle(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createNewsMutation.isPending || updateNewsMutation.isPending}
                >
                  {(createNewsMutation.isPending || updateNewsMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {currentArticle ? "Atualizar" : "Publicar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteArticle}
              disabled={deleteNewsMutation.isPending}
            >
              {deleteNewsMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}