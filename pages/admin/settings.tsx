import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Save, Settings, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Setting {
  id: number;
  key: string;
  value: string;
  category: string;
  description: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, any>>({});

  // Carregar configurações do site
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
  });

  // Mutation para salvar configurações
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      return await apiRequest("PATCH", "/api/admin/settings", { settings });
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      setUnsavedChanges({});
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  // Função para atualizar localmente um valor configurado
  const updateSetting = (key: string, value: string) => {
    setUnsavedChanges((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Função para salvar todas as alterações
  const saveChanges = async () => {
    if (Object.keys(unsavedChanges).length === 0) {
      toast({
        title: "Nenhuma alteração",
        description: "Não há alterações para salvar.",
      });
      return;
    }

    await saveSettingsMutation.mutateAsync(unsavedChanges);
  };

  // Helper para obter valor atual (do estado local ou dos dados carregados)
  const getValue = (key: string) => {
    if (key in unsavedChanges) {
      return unsavedChanges[key];
    }
    
    if (!settings || !settings.settings || !Array.isArray(settings.settings)) return "";
    
    const setting = settings.settings.find((s: Setting) => s.key === key);
    return setting ? setting.value : "";
  };

  // Helper para agrupar configurações por categoria
  const getSettingsByCategory = (category: string) => {
    if (!settings || !settings.settings || !Array.isArray(settings.settings)) return [];
    return settings.settings.filter((setting: Setting) => setting.category === category);
  };

  // Renderizar controle baseado no tipo de configuração
  const renderSettingControl = (setting: Setting) => {
    const value = getValue(setting.key);
    
    // Detectar tipo de configuração com base no nome da chave ou no valor
    if (setting.key.includes('enabled') || setting.key.includes('active')) {
      return (
        <Switch 
          checked={value === 'true'} 
          onCheckedChange={(checked) => updateSetting(setting.key, checked.toString())}
        />
      );
    } else if (setting.key.includes('color')) {
      return (
        <div className="flex items-center gap-2">
          <Input 
            type="color" 
            value={value} 
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input 
            type="text" 
            value={value} 
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="w-full"
          />
        </div>
      );
    } else if (setting.key.includes('content') || value.length > 100) {
      return (
        <Textarea 
          value={value} 
          onChange={(e) => updateSetting(setting.key, e.target.value)}
          rows={4}
        />
      );
    } else if (setting.key.includes('theme')) {
      return (
        <Select 
          value={value} 
          onValueChange={(value) => updateSetting(setting.key, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dark">Escuro</SelectItem>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="system">Sistema</SelectItem>
          </SelectContent>
        </Select>
      );
    } else {
      return (
        <Input 
          value={value} 
          onChange={(e) => updateSetting(setting.key, e.target.value)}
        />
      );
    }
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do site
          </p>
        </div>
        <Button 
          onClick={saveChanges}
          disabled={Object.keys(unsavedChanges).length === 0 || saveSettingsMutation.isPending}
        >
          {saveSettingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-border" />
        </div>
      ) : (
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="server">Servidor</TabsTrigger>
            <TabsTrigger value="integration">Integrações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Informações básicas do site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('general').map((setting: Setting) => (
                  <div key={setting.key} className="grid gap-2">
                    <Label htmlFor={setting.key}>{setting.description}</Label>
                    {renderSettingControl(setting)}
                  </div>
                ))}

                {getSettingsByCategory('general').length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Nenhuma configuração disponível nesta categoria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aparência do Site</CardTitle>
                <CardDescription>
                  Personalize a aparência do site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('appearance').map((setting: Setting) => (
                  <div key={setting.key} className="grid gap-2">
                    <Label htmlFor={setting.key}>{setting.description}</Label>
                    {renderSettingControl(setting)}
                  </div>
                ))}

                {getSettingsByCategory('appearance').length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Nenhuma configuração disponível nesta categoria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="server" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Servidor</CardTitle>
                <CardDescription>
                  Gerencie configurações relacionadas ao servidor de jogo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('server').map((setting: Setting) => (
                  <div key={setting.key} className="grid gap-2">
                    <Label htmlFor={setting.key}>{setting.description}</Label>
                    {renderSettingControl(setting)}
                  </div>
                ))}

                {getSettingsByCategory('server').length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Nenhuma configuração disponível nesta categoria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
                <CardDescription>
                  Configure integrações com serviços externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Integração com Discord</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure a autenticação OAuth2 com o Discord.
                  </p>
                  
                  <div className="space-y-4 border rounded-md p-4">
                    <div className="grid gap-2">
                      <Label htmlFor="discord_oauth_enabled">Ativar autenticação Discord</Label>
                      <Switch 
                        checked={getValue("discord_oauth_enabled") === 'true'} 
                        onCheckedChange={(checked) => updateSetting("discord_oauth_enabled", checked.toString())}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="discord_client_id">Client ID</Label>
                      <Input 
                        id="discord_client_id"
                        value={getValue("discord_client_id")} 
                        onChange={(e) => updateSetting("discord_client_id", e.target.value)}
                        placeholder="Digite o Client ID da aplicação Discord"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="discord_client_secret">Client Secret</Label>
                      <Input 
                        id="discord_client_secret"
                        type="password"
                        value={getValue("discord_client_secret")} 
                        onChange={(e) => updateSetting("discord_client_secret", e.target.value)}
                        placeholder="Digite o Client Secret da aplicação Discord"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="discord_callback_url">URL de Callback</Label>
                      <Input 
                        id="discord_callback_url"
                        value={getValue("discord_callback_url")} 
                        onChange={(e) => updateSetting("discord_callback_url", e.target.value)}
                        placeholder="http://seu-servidor.com/api/auth/discord/callback"
                      />
                      <p className="text-xs text-muted-foreground">
                        Este URL deve ser configurado nas opções OAuth2 da sua aplicação Discord
                      </p>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="discord_auth_scope">Escopo da Autenticação</Label>
                      <Input 
                        id="discord_auth_scope"
                        value={getValue("discord_auth_scope")} 
                        onChange={(e) => updateSetting("discord_auth_scope", e.target.value)}
                        placeholder="identify email guilds"
                      />
                      <p className="text-xs text-muted-foreground">
                        Lista de permissões separadas por espaço que seu app solicitará
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Integração com Servidor Discord</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure a integração com seu servidor Discord.
                  </p>
                  
                  <div className="space-y-4 border rounded-md p-4">
                    <div className="grid gap-2">
                      <Label htmlFor="discord_server_id">ID do Servidor Discord</Label>
                      <Input 
                        id="discord_server_id"
                        value={getValue("discord_server_id")} 
                        onChange={(e) => updateSetting("discord_server_id", e.target.value)}
                        placeholder="Digite o ID do servidor Discord"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="discord_invite_url">URL de Convite</Label>
                      <Input 
                        id="discord_invite_url"
                        value={getValue("discord_invite_url")} 
                        onChange={(e) => updateSetting("discord_invite_url", e.target.value)}
                        placeholder="https://discord.gg/seu-convite"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    As configurações de integração com Discord exigem reinicialização do servidor para aplicar as alterações.
                  </AlertDescription>
                </Alert>
                
                {/* Configurações adicionais de outros serviços */}
                {getSettingsByCategory('integration')?.length > 0 &&
                  getSettingsByCategory('integration')
                    .filter(setting => 
                      !setting.key.startsWith('discord_')
                    )
                    .map((setting: Setting) => (
                      <div key={setting.key} className="grid gap-2">
                        <Label htmlFor={setting.key}>{setting.description}</Label>
                        {renderSettingControl(setting)}
                      </div>
                    ))
                }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}