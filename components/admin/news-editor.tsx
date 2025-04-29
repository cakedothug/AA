import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface NewsEditorProps {
  articleId?: number;
  onSuccess?: (slug: string) => void;
}

// Schema para validação do formulário
const newsSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres").max(100, "O título deve ter no máximo 100 caracteres"),
  slug: z.string().min(5, "O slug deve ter pelo menos 5 caracteres").max(100, "O slug deve ter no máximo 100 caracteres"),
  content: z.string().min(20, "O conteúdo deve ter pelo menos 20 caracteres"),
  excerpt: z.string().min(10, "O resumo deve ter pelo menos 10 caracteres").max(200, "O resumo deve ter no máximo 200 caracteres"),
  coverImage: z.string().url("A URL da imagem de capa é inválida"),
  categoryId: z.coerce.number().optional(),
  published: z.boolean().default(true),
  scheduledFor: z.date().optional(),
  featured: z.boolean().default(false),
});

type NewsFormValues = z.infer<typeof newsSchema>;

const NewsEditor: React.FC<NewsEditorProps> = ({ articleId, onSuccess }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isTitleDirty, setIsTitleDirty] = useState(false);
  const [quillContent, setQuillContent] = useState("");

  // Buscar categorias
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/news/categories"],
    select: (data) => data.categories as NewsCategory[],
  });

  // Configurar o formulário
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      coverImage: "",
      categoryId: undefined,
      published: true,
      featured: false,
      scheduledFor: undefined,
    },
  });
  
  const watchTitle = form.watch("title");
  
  // Buscar artigo para edição, se necessário
  const { data: articleData, isLoading: isLoadingArticle } = useQuery({
    queryKey: [`/api/news/${articleId}`],
    enabled: !!articleId,
    onSuccess: (data) => {
      if (data && data.article) {
        setIsEditing(true);
        const scheduledFor = data.article.scheduledFor 
          ? new Date(data.article.scheduledFor) 
          : undefined;
          
        form.reset({
          title: data.article.title,
          slug: data.article.slug,
          content: data.article.content,
          excerpt: data.article.excerpt,
          coverImage: data.article.coverImage,
          categoryId: data.article.category?.id,
          published: data.article.published,
          featured: data.article.featured || false,
          scheduledFor: scheduledFor,
        });
        
        if (data.article.content) {
          setQuillContent(data.article.content);
        }
      }
    },
  });

  // Gerar slug automaticamente a partir do título, se o título for modificado e o slug não tiver sido editado manualmente
  useEffect(() => {
    if (watchTitle && !isTitleDirty) {
      form.setValue("slug", slugify(watchTitle));
    }
  }, [watchTitle, form, isTitleDirty]);

  // Mutation para criar/atualizar notícia
  const mutation = useMutation({
    mutationFn: async (data: NewsFormValues) => {
      if (isEditing && articleId) {
        return apiRequest("PUT", `/api/admin/news/${articleId}`, data);
      } else {
        return apiRequest("POST", "/api/admin/news", data);
      }
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      
      toast({
        title: isEditing ? "Notícia atualizada" : "Notícia criada",
        description: isEditing ? "A notícia foi atualizada com sucesso." : "A notícia foi criada com sucesso.",
      });
      
      if (onSuccess && data.article) {
        onSuccess(data.article.slug);
      }
    },
    onError: (error) => {
      toast({
        title: `Erro ao ${isEditing ? 'atualizar' : 'criar'} notícia`,
        description: error instanceof Error ? error.message : `Ocorreu um erro ao ${isEditing ? 'atualizar' : 'criar'} a notícia.`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: NewsFormValues) => {
    mutation.mutate(data);
  };

  if (articleId && isLoadingArticle) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full bg-[#2D2D2D]" />
        <Skeleton className="h-10 w-full bg-[#2D2D2D]" />
        <Skeleton className="h-40 w-full bg-[#2D2D2D]" />
        <Skeleton className="h-20 w-full bg-[#2D2D2D]" />
        <Skeleton className="h-10 w-full bg-[#2D2D2D]" />
        <Skeleton className="h-10 w-full bg-[#2D2D2D]" />
        <Skeleton className="h-10 w-32 bg-[#2D2D2D]" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {mutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {mutation.error instanceof Error 
                ? mutation.error.message 
                : `Ocorreu um erro ao ${isEditing ? 'atualizar' : 'criar'} a notícia.`}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Título</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o título da notícia"
                    className="bg-[#1A1A1A] border-[#2D2D2D] text-white"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-gray-400">
                  O título principal da notícia.
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
                <FormLabel className="text-white">Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="url-amigavel-da-noticia"
                    className="bg-[#1A1A1A] border-[#2D2D2D] text-white"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setIsTitleDirty(true);
                    }}
                  />
                </FormControl>
                <FormDescription className="text-gray-400">
                  URL amigável para a notícia.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Conteúdo</FormLabel>
              <FormControl>
                <div className="rounded-md border border-[#2D2D2D] bg-[#1A1A1A] text-white">
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={(content) => {
                      field.onChange(content);
                      setQuillContent(content);
                    }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                        ['link', 'image', 'video'],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header',
                      'bold', 'italic', 'underline', 'strike', 'blockquote',
                      'list', 'bullet', 'indent',
                      'link', 'image', 'video'
                    ]}
                    className="bg-[#1A1A1A] text-white min-h-[200px]"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-gray-400 mt-2">
                Conteúdo completo da notícia. Use as ferramentas de formatação acima para estilizar o texto.
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
              <FormLabel className="text-white">Resumo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite um breve resumo da notícia..."
                  className="bg-[#1A1A1A] border-[#2D2D2D] text-white"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Breve resumo que será exibido nas listagens de notícias.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Imagem de Capa</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="bg-[#1A1A1A] border-[#2D2D2D] text-white"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                URL da imagem de capa da notícia.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Categoria</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value) || undefined)}
                  value={field.value?.toString()}
                  disabled={isLoadingCategories}
                >
                  <FormControl>
                    <SelectTrigger className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
                    <SelectItem 
                      value="none"
                      className="focus:bg-[#2D2D2D] focus:text-white"
                    >
                      Sem categoria
                    </SelectItem>
                    {categoriesData?.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id.toString()}
                        className="focus:bg-[#2D2D2D] focus:text-white"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-gray-400">
                  Categoria da notícia.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="scheduledFor"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-white">Agendamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal bg-[#1A1A1A] border-[#2D2D2D] text-white ${!field.value && "text-muted-foreground"}`}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-[#2D2D2D]" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date <= new Date()}
                      initialFocus
                      locale={ptBR}
                      className="bg-[#1A1A1A] text-white"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-gray-400">
                  Opcional: Agende a publicação para uma data futura.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#2D2D2D] p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-white">Publicado</FormLabel>
                  <FormDescription className="text-gray-400">
                    Status de publicação da notícia.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-[#00E5FF]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#2D2D2D] p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-white">Destaque</FormLabel>
                  <FormDescription className="text-gray-400">
                    Exibir esta notícia em destaque na página inicial.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-[#00E5FF]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            className="border-[#2D2D2D] text-white hover:bg-[#2D2D2D]"
            onClick={() => {
              form.reset();
              if (articleId && articleData?.article) {
                const scheduledFor = articleData.article.scheduledFor 
                  ? new Date(articleData.article.scheduledFor) 
                  : undefined;
                
                form.reset({
                  title: articleData.article.title,
                  slug: articleData.article.slug,
                  content: articleData.article.content,
                  excerpt: articleData.article.excerpt,
                  coverImage: articleData.article.coverImage,
                  categoryId: articleData.article.category?.id,
                  published: articleData.article.published,
                  featured: articleData.article.featured || false,
                  scheduledFor: scheduledFor,
                });
                
                if (articleData.article.content) {
                  setQuillContent(articleData.article.content);
                }
              }
            }}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            className="bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black"
            disabled={mutation.isPending}
          >
            {mutation.isPending 
              ? (isEditing ? "Atualizando..." : "Criando...") 
              : (isEditing ? "Atualizar Notícia" : "Criar Notícia")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewsEditor;
