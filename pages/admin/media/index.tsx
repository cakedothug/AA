import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, Trash2, Plus, Image, ImagePlus, ThumbsUp, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// Validação com Zod
const mediaItemSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  imageUrl: z.string().url("URL da imagem inválida"),
  type: z.enum(["screenshot", "artwork", "meme", "other"]),
  approved: z.boolean().default(false),
});

type MediaFormValues = z.infer<typeof mediaItemSchema>;

interface MediaItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  type: "screenshot" | "artwork" | "meme" | "other";
  approved: boolean;
  userId: number | null;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    avatar: string | null;
  };
}

export default function AdminMediaManager() {
  const { toast } = useToast();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Buscar items de mídia
  const { data: mediaItems, isLoading: mediaLoading } = useQuery({
    queryKey: ['/api/admin/media'],
  });

  const form = useForm<MediaFormValues>({
    resolver: zodResolver(mediaItemSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      type: "screenshot",
      approved: false,
    },
  });

  // Mutation para adicionar item de mídia
  const addMediaMutation = useMutation({
    mutationFn: async (data: MediaFormValues) => {
      return await apiRequest("POST", "/api/admin/media", data);
    },
    onSuccess: () => {
      toast({
        title: "Imagem adicionada",
        description: "Imagem adicionada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/media'] });
      setIsAddingItem(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar imagem",
        description: error.message || "Ocorreu um erro ao adicionar a imagem",
        variant: "destructive",
      });
    },
  });

  // Mutation para aprovar item de mídia
  const approveMediaMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PATCH", `/api/admin/media/${id}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Imagem aprovada",
        description: "Imagem aprovada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/media'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao aprovar imagem",
        description: error.message || "Ocorreu um erro ao aprovar a imagem",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar item de mídia
  const deleteMediaMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/media/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Imagem removida",
        description: "Imagem removida com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/media'] });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover imagem",
        description: error.message || "Ocorreu um erro ao remover a imagem",
        variant: "destructive",
      });
    },
  });

  // Form submit handler
  const onSubmit = async (data: MediaFormValues) => {
    await addMediaMutation.mutateAsync(data);
  };

  // Filtrar items por tipo/status
  const getFilteredItems = () => {
    if (!mediaItems) return [];

    if (activeTab === "all") {
      return mediaItems;
    } else if (activeTab === "pending") {
      return mediaItems.filter((item: MediaItem) => !item.approved);
    } else if (activeTab === "approved") {
      return mediaItems.filter((item: MediaItem) => item.approved);
    } else {
      return mediaItems.filter((item: MediaItem) => item.type === activeTab);
    }
  };

  // Handle approve media item
  const handleApproveMedia = async (id: number) => {
    await approveMediaMutation.mutateAsync(id);
  };

  // Handle delete media item
  const handleDeleteMedia = (id: number) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Format date
  const formatMediaDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "screenshot": return "Captura de Tela";
      case "artwork": return "Arte";
      case "meme": return "Meme";
      case "other": return "Outro";
      default: return type;
    }
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Galeria de Mídia</h1>
          <p className="text-muted-foreground">
            Gerencie imagens e capturas da comunidade
          </p>
        </div>
        <Button onClick={() => setIsAddingItem(true)}>
          <ImagePlus className="mr-2 h-4 w-4" />
          Adicionar Imagem
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-7 md:w-auto w-full">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="screenshot">Capturas</TabsTrigger>
          <TabsTrigger value="artwork">Artes</TabsTrigger>
          <TabsTrigger value="meme">Memes</TabsTrigger>
          <TabsTrigger value="other">Outros</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {mediaLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-border" />
            </div>
          ) : getFilteredItems().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredItems().map((item: MediaItem) => (
                <Card key={item.id} className={!item.approved ? "bg-muted/20" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>
                          <span className="inline-block mr-2 px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                            {getTypeLabel(item.type)}
                          </span>
                          {!item.approved && (
                            <span className="inline-block px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">
                              Pendente
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!item.approved && (
                            <DropdownMenuItem onClick={() => handleApproveMedia(item.id)}>
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              Aprovar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <a 
                              href={item.imageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ver em tamanho real
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteMedia(item.id)}
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
                    <div className="aspect-video w-full rounded-md overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 text-xs text-muted-foreground">
                    {item.user ? (
                      <span>Enviada por {item.user.username} em {formatMediaDate(item.createdAt)}</span>
                    ) : (
                      <span>Enviada em {formatMediaDate(item.createdAt)}</span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-10">
              <CardContent>
                <div className="flex flex-col items-center">
                  <Image className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhuma imagem encontrada nesta categoria.
                  </p>
                  <Button onClick={() => setIsAddingItem(true)}>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Adicionar Imagem
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar nova imagem */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Imagem</DialogTitle>
            <DialogDescription>
              Adicione uma nova imagem à galeria.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="screenshot">Captura de Tela</option>
                        <option value="artwork">Arte</option>
                        <option value="meme">Meme</option>
                        <option value="other">Outro</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://exemplo.com/imagem.jpg" />
                    </FormControl>
                    <FormDescription>
                      Insira o link direto para a imagem
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Aprovar Automaticamente</FormLabel>
                      <FormDescription>
                        Esta mídia será aprovada imediatamente
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingItem(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={addMediaMutation.isPending}
                >
                  {addMediaMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Adicionar
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
              Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.
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
              onClick={() => itemToDelete && deleteMediaMutation.mutateAsync(itemToDelete)}
              disabled={deleteMediaMutation.isPending}
            >
              {deleteMediaMutation.isPending && (
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