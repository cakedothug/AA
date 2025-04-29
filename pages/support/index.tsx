import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, HelpCircle } from "lucide-react";

// Schema para o ticket
const ticketSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
  message: z.string().min(20, "A mensagem deve ter pelo menos 20 caracteres"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      category: "",
      message: "",
    },
  });

  // Mutation para criar um ticket
  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormValues) => {
      return await apiRequest("POST", "/api/user/tickets", data);
    },
    onSuccess: () => {
      toast({
        title: "Ticket criado",
        description: "Seu ticket foi criado com sucesso. Nossa equipe responderá em breve.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/tickets'] });
      setLocation("/profile");
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar ticket",
        description: error.message || "Ocorreu um erro ao criar seu ticket. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: TicketFormValues) => {
    await createTicketMutation.mutateAsync(data);
  };

  if (!user) {
    return (
      <div className="container py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa estar conectado para acessar o suporte.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/login")} className="w-full">
              Fazer Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Suporte</h1>
          <p className="text-muted-foreground">
            Envie sua dúvida ou problema para nossa equipe
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Novo Ticket</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo para abrir um ticket de suporte
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          placeholder="Resumo do seu problema ou dúvida" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Um título claro ajuda a identificar seu problema rapidamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="account">Problemas com conta</SelectItem>
                          <SelectItem value="technical">Problemas técnicos</SelectItem>
                          <SelectItem value="payment">Pagamentos</SelectItem>
                          <SelectItem value="rules">Regras e moderação</SelectItem>
                          <SelectItem value="suggestion">Sugestões</SelectItem>
                          <SelectItem value="other">Outros assuntos</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecione a categoria que melhor descreve seu problema
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva seu problema ou dúvida em detalhes..." 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Forneça o máximo de detalhes possível para ajudarmos melhor
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Ticket
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center mb-2">
            <HelpCircle className="h-5 w-5 mr-2 text-primary" />
            <span className="text-sm font-medium">Precisa de ajuda imediata?</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Para problemas urgentes, entre em contato através do nosso Discord
          </p>
          <Button variant="link" className="mt-2">
            <a href="https://discord.gg/tokyoedgerp" target="_blank" rel="noopener noreferrer">
              Acessar Discord
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}