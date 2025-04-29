import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Schema de validação
const applicationSchema = z.object({
  positionInterest: z.string().min(3, "A posição precisa ter pelo menos 3 caracteres"),
  age: z.number().min(16, "Você deve ter pelo menos 16 anos"),
  timezone: z.string().min(1, "Por favor, informe seu fuso horário"),
  languages: z.string().min(1, "Por favor, informe seus idiomas"),
  availability: z.number().min(1, "Informe disponibilidade em horas semanais"),
  rpExperience: z.string().min(20, "Informe sua experiência em RP com mais detalhes (mínimo 20 caracteres)"),
  moderationExperience: z.string().min(20, "Informe sua experiência em moderação com mais detalhes (mínimo 20 caracteres)"),
  whyJoin: z.string().min(20, "Informe seu motivo com mais detalhes (mínimo 20 caracteres)"),
  skills: z.string().min(10, "Informe suas habilidades (mínimo 10 caracteres)"),
  additionalInfo: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function ApplicationPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Formulário
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      positionInterest: "",
      age: 18,
      timezone: "GMT-3 (Brasil)",
      languages: "Português, Inglês",
      availability: 10,
      rpExperience: "",
      moderationExperience: "",
      whyJoin: "",
      skills: "",
      additionalInfo: ""
    }
  });

  // Mutation para enviar candidatura
  const submitMutation = useMutation({
    mutationFn: async (data: ApplicationFormValues) => {
      return await apiRequest("POST", "/api/applications", data);
    },
    onSuccess: () => {
      toast({
        title: "Candidatura enviada",
        description: "Sua candidatura foi enviada com sucesso e será analisada em breve.",
      });
      setLocation("/profile");
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar candidatura",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Verificar se o usuário está autenticado
  if (authLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-border" />
      </div>
    );
  }

  // Redirecionar para página de login se não estiver autenticado
  if (!user) {
    setLocation("/auth");
    return null;
  }

  // Enviar formulário
  const onSubmit = (data: ApplicationFormValues) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Candidatura para Staff</h1>
          <p className="text-muted-foreground">
            Preencha o formulário abaixo para se candidatar a uma posição na equipe do Tokyo Edge Roleplay.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Formulário de Candidatura</CardTitle>
                <CardDescription>
                  Preencha todos os campos com atenção e honestidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="positionInterest"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posição Desejada</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Moderador, Administrador, Suporte, etc." 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Informe qual cargo você gostaria de ocupar na equipe
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idade</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Sua idade" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Informe sua idade atual
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuso Horário</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: GMT-3 (Brasil)" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Seu fuso horário
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="languages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idiomas</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Português, Inglês" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Idiomas que você fala
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disponibilidade (horas por semana)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Ex: 10" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Quantas horas por semana você pode dedicar ao servidor
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rpExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experiência em Roleplay</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva sua experiência em servidores de roleplay..." 
                              className="min-h-32" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Descreva suas experiências anteriores em RP
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="moderationExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experiência em Moderação</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva sua experiência como moderador em outras comunidades..." 
                              className="min-h-32" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Descreva suas experiências anteriores em moderação de comunidades
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="whyJoin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Por que quer se juntar à equipe</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Por que você quer fazer parte da nossa equipe? Quais são suas motivações?" 
                              className="min-h-32" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Explique por que você quer fazer parte da nossa equipe
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Habilidades</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Quais habilidades você possui que seriam úteis para a função?" 
                              className="min-h-24" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Descreva suas habilidades relevantes para a função
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Informações Adicionais (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Compartilhe quaisquer informações adicionais que você acha importante para sua candidatura..." 
                              className="min-h-24" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Informações extras que você gostaria de compartilhar
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={submitMutation.isPending}
                      >
                        {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Candidatura
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Seu Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {user?.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.username} />
                    ) : (
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    {user.discordUsername && (
                      <p className="text-sm text-muted-foreground">
                        Discord: {user.discordUsername}
                      </p>
                    )}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="rounded-md bg-yellow-50 p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc space-y-1 pl-5">
                          <li>Candidaturas são avaliadas pela administração.</li>
                          <li>O processo pode levar até 7 dias.</li>
                          <li>Mantenha seu perfil atualizado com informações de contato.</li>
                          <li>Apenas uma candidatura ativa por vez é permitida.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setLocation("/profile")}
                >
                  Voltar ao Perfil
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}