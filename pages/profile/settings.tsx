import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Settings, Moon, Monitor, Paintbrush } from "lucide-react";

// Schema para atualização de perfil geral
const profileSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.password && !data.confirmPassword) return false;
  if (!data.password && data.confirmPassword) return false;
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) return false;
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Schema para configurações de aparência
const appearanceSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  reducedMotion: z.boolean().default(false),
  fontSize: z.enum(["small", "medium", "large"]),
  highContrast: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type AppearanceFormValues = z.infer<typeof appearanceSchema>;

export default function UserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  // Formulário geral
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      password: "",
      confirmPassword: "",
    },
  });

  // Formulário aparência
  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      theme: "system",
      reducedMotion: false,
      fontSize: "medium",
      highContrast: false,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Remover confirmPassword antes de enviar
      const { confirmPassword, ...profileData } = data;
      // Remover senha vazia se for o caso
      if (!profileData.password) {
        delete profileData.password;
      }
      return await apiRequest("PATCH", "/api/auth/profile", profileData);
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      });
      // Invalidar cache do usuário para atualizar dados na UI
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil",
        variant: "destructive",
      });
    },
  });

  const updateAppearanceMutation = useMutation({
    mutationFn: async (data: AppearanceFormValues) => {
      return await apiRequest("PATCH", "/api/user/settings/appearance", data);
    },
    onSuccess: () => {
      toast({
        title: "Configurações de aparência salvas",
        description: "Suas configurações de aparência foram atualizadas",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Ocorreu um erro ao atualizar as configurações",
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = async (data: ProfileFormValues) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const onSubmitAppearance = async (data: AppearanceFormValues) => {
    await updateAppearanceMutation.mutateAsync(data);
  };

  const getAvatarFallback = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Configurações</h1>
      <p className="text-muted-foreground mb-6">Gerencie suas informações e preferências</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Coluna lateral */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seu Perfil</CardTitle>
              <CardDescription>
                Informações visíveis para outros usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user?.avatar || undefined} alt={user?.username || "Avatar"} />
                <AvatarFallback>{getAvatarFallback(user?.username || "U")}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-medium">{user?.username}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.role === 'admin' ? 'Administrador' : user?.role === 'moderator' ? 'Moderador' : 'Membro'}
                </p>
              </div>
              
              {user?.discordId && (
                <div className="mt-4 text-sm text-center">
                  <p>Conta vinculada ao Discord</p>
                  {user.discordUsername && (
                    <p className="text-muted-foreground">{user.discordUsername}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Menu de navegação */}
          <Card>
            <CardContent className="p-3">
              <div className="space-y-1">
                <Button 
                  variant={activeTab === "general" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("general")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Geral
                </Button>
                <Button 
                  variant={activeTab === "appearance" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("appearance")}
                >
                  <Paintbrush className="mr-2 h-4 w-4" />
                  Aparência
                </Button>
                
                {/* Opções administrativas - apenas para admins */}
                {user?.role === 'admin' && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs text-muted-foreground px-3 py-1">Administração</p>
                    <Button 
                      variant={activeTab === "server" ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab("server")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Servidor
                    </Button>
                    <Button 
                      variant={activeTab === "integrations" ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab("integrations")}
                    >
                      <Monitor className="mr-2 h-4 w-4" />
                      Integrações
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna principal */}
        <div className="md:col-span-3">
          {/* Conteúdo das abas */}
          <div className="space-y-6">
            {/* Aba Geral */}
            {activeTab === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Conta</CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome de usuário</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Este é o nome que será exibido no site.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator className="my-4" />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Alterar senha</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Deixe em branco para manter a senha atual
                        </p>
                        
                        <div className="grid gap-4">
                          <FormField
                            control={profileForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nova senha</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirmar nova senha</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar alterações
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Aba Aparência */}
            {activeTab === "appearance" && (
              <Card>
                <CardHeader>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription>
                    Personalize a aparência do site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...appearanceForm}>
                    <form onSubmit={appearanceForm.handleSubmit(onSubmitAppearance)} className="space-y-6">
                      <FormField
                        control={appearanceForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tema</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um tema" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="light">
                                  <div className="flex items-center">
                                    <Monitor className="h-4 w-4 mr-2" />
                                    <span>Claro</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="dark">
                                  <div className="flex items-center">
                                    <Moon className="h-4 w-4 mr-2" />
                                    <span>Escuro</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="system">
                                  <div className="flex items-center">
                                    <Settings className="h-4 w-4 mr-2" />
                                    <span>Sistema</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Escolha o tema de cores para o site
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={appearanceForm.control}
                        name="fontSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tamanho da fonte</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um tamanho" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="small">Pequeno</SelectItem>
                                <SelectItem value="medium">Médio</SelectItem>
                                <SelectItem value="large">Grande</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Ajuste o tamanho do texto do site
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={appearanceForm.control}
                        name="reducedMotion"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Reduzir movimento</FormLabel>
                              <FormDescription>
                                Desative animações e transições
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

                      <FormField
                        control={appearanceForm.control}
                        name="highContrast"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Alto contraste</FormLabel>
                              <FormDescription>
                                Aumente o contraste para melhor legibilidade
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
                      
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto"
                        disabled={updateAppearanceMutation.isPending}
                      >
                        {updateAppearanceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar preferências
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}