import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { SiDiscord } from "react-icons/si";
import { Redirect, useLocation } from "wouter";
import { Loader2, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schema para validação do formulário de login
const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, isLoading, loginMutation } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Verificar se há erro de login vindo da URL
  const searchParams = new URLSearchParams(
    location.includes('?') ? location.slice(location.indexOf('?')) : ''
  );
  const error = searchParams.get('error');

  // Se houver erro na URL, mostrar um toast de erro
  useEffect(() => {
    if (error === 'discord_not_configured') {
      toast({
        title: "Erro de configuração",
        description: "O login com Discord não está configurado no servidor. Use o login administrativo.",
        variant: "destructive"
      });
    } else if (error === 'true') {
      toast({
        title: "Erro de autenticação",
        description: "Falha ao autenticar com Discord. Tente novamente ou use outro método de login.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Configuração do formulário com react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Redirect to home if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleDiscordLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onError: (error) => {
        toast({
          title: "Erro ao fazer login",
          description: "Usuário ou senha inválidos. Tente novamente.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-8 lg:gap-12">
        <div className="lg:w-1/2 flex flex-col justify-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Tokyo Edge Roleplay
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Entre com seu Discord para acessar nosso portal comunitário e participar de todas as atividades do servidor.
          </p>
          
          <div className="hidden lg:block space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary">1</span>
              </div>
              <p>Acesse o painel da comunidade</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary">2</span>
              </div>
              <p>Envie formulários para a equipe</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary">3</span>
              </div>
              <p>Fique por dentro das atualizações</p>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2">
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
              <CardDescription>
                Utilize uma das opções abaixo para acessar a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAdminLogin ? (
                // Formulário de login para admin
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome de usuário" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Digite sua senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Shield className="h-4 w-4 mr-2" />
                        )}
                        Login Administrativo
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAdminLogin(false)}
                      >
                        Voltar
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                // Opções regulares de login
                <>
                  <div className="space-y-2">
                    <Button 
                      className="w-full flex items-center gap-2" 
                      onClick={handleDiscordLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <SiDiscord className="h-4 w-4" />
                      )}
                      <span>Entrar com Discord</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={() => setShowAdminLogin(true)}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Login Administrativo</span>
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Informações</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>
                      O login para membros é feito através da sua conta no Discord. Suas informações como 
                      usuário e avatar são sincronizadas automaticamente.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-xs text-muted-foreground text-center w-full">
                Ao fazer login, você concorda com nossos{" "}
                <a href="/terms" className="underline underline-offset-2 hover:text-primary">
                  Termos de Serviço
                </a>{" "}
                e{" "}
                <a href="/privacy" className="underline underline-offset-2 hover:text-primary">
                  Política de Privacidade
                </a>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}