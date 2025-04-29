import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertStaffApplicationSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Estendendo o esquema para validação com o zod
const applicationSchema = z.object({
  age: z.coerce.number().min(16, "Você deve ter pelo menos 16 anos").max(99, "Idade inválida"),
  timezone: z.string().min(1, "Selecione seu fuso horário"),
  languages: z.string().min(3, "Informe pelo menos um idioma"),
  availability: z.coerce.number().min(5, "Mínimo de 5 horas por semana").max(168, "Valor inválido"),
  rpExperience: z.string().min(20, "Forneça mais detalhes sobre sua experiência"),
  moderationExperience: z.string().min(5, "Por favor, responda esta pergunta"),
  serverFamiliarity: z.string().min(1, "Selecione uma opção"),
  whyJoin: z.string().min(20, "Por favor, elabore mais sua resposta"),
  scenario: z.string().min(20, "Forneça uma resposta mais detalhada"),
  contribution: z.string().min(20, "Por favor, elabore mais sua resposta"),
  additionalInfo: z.string().optional(),
  termsAgreed: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos",
  }),
});

// Criando o tipo baseado no schema
type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  discordId?: string;
  discordUsername?: string;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ discordId, discordUsername }) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definindo valores iniciais
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      age: undefined,
      timezone: "",
      languages: "Português",
      availability: undefined,
      rpExperience: "",
      moderationExperience: "",
      serverFamiliarity: "",
      whyJoin: "",
      scenario: "",
      contribution: "",
      additionalInfo: "",
      termsAgreed: false,
    },
  });

  // Mutação para enviar a aplicação
  const mutation = useMutation({
    mutationFn: async (data: Omit<ApplicationFormValues, "termsAgreed">) => {
      const response = await apiRequest("POST", "/api/applications", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Aplicação enviada com sucesso!",
        description: "Nossa equipe irá revisar sua aplicação em breve.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar aplicação",
        description: error instanceof Error ? error.message : "Houve um erro ao enviar sua aplicação. Tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: ApplicationFormValues) => {
    setIsSubmitting(true);
    
    // Removendo o campo termsAgreed antes de enviar para a API
    const { termsAgreed, ...applicationData } = data;
    
    mutation.mutate(applicationData);
  };

  return (
    <div className="max-w-4xl mx-auto glassmorphism p-8 rounded-lg">
      <h2 className="text-2xl font-rajdhani font-bold text-white mb-6 text-center">
        Formulário de Aplicação para Staff
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Pessoais */}
          <div>
            <h3 className="text-lg font-rajdhani font-bold text-[#00E5FF] mb-4">
              Informações Pessoais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Idade <span className="text-[#FF0A54]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="16"
                        max="99"
                        placeholder="Sua idade"
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white focus:ring-[#00E5FF]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Fuso Horário <span className="text-[#FF0A54]">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#1A1A1A] border-[#2D2D2D] text-white focus:ring-[#00E5FF]">
                          <SelectValue placeholder="Selecione seu fuso horário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
                        <SelectItem value="GMT-3">GMT-3 (Brasil)</SelectItem>
                        <SelectItem value="GMT-2">GMT-2</SelectItem>
                        <SelectItem value="GMT-4">GMT-4</SelectItem>
                        <SelectItem value="GMT-5">GMT-5</SelectItem>
                        <SelectItem value="GMT+0">GMT+0</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Idiomas que você fala <span className="text-[#FF0A54]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Português, Inglês, Espanhol"
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white focus:ring-[#00E5FF]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Disponibilidade Semanal (horas) <span className="text-[#FF0A54]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="5"
                        max="168"
                        placeholder="Horas disponíveis por semana"
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white focus:ring-[#00E5FF]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Experiência */}
          <div>
            <h3 className="text-lg font-rajdhani font-bold text-[#00E5FF] mb-4">
              Experiência
            </h3>
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="rpExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Descreva sua experiência com Roleplay <span className="text-[#FF0A54]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Conte-nos sobre sua experiência anterior com roleplay, servidores que participou, etc."
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white focus:ring-[#00E5FF]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="moderationExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Você tem experiência como moderador/administrador? <span className="text-[#FF0A54]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Se sim, descreva onde, por quanto tempo e quais eram suas responsabilidades."
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white focus:ring-[#00E5FF]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="serverFamiliarity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Há quanto tempo você conhece o Tokyo Edge RP? <span className="text-[#FF0A54]">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#1A1A1A] border-[#2D2D2D] text-white focus:ring-[#00E5FF]">
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
                        <SelectItem value="less_than_week">Menos de uma semana</SelectItem>
                        <SelectItem value="week_to_month">Entre uma semana e um mês</SelectItem>
                        <SelectItem value="one_to_three_months">1-3 meses</SelectItem>
                        <SelectItem value="three_to_six_months">3-6 meses</SelectItem>
                        <SelectItem value="more_than_six_months">Mais de 6 meses</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Perguntas */}
          <div>
            <h3 className="text-lg font-rajdhani font-bold text-[#00E5FF] mb-4">
              Perguntas
            </h3>
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="whyJoin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Por que você quer se juntar à equipe de Staff? <span className="text-[#FF0A54]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Explique suas motivações para se juntar à nossa equipe."
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white focus:ring-[#00E5FF]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scenario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Como você lidaria com um jogador que está desrespeitando as regras de RP? <span className="text-[#FF0A54]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Descreva como você abordaria esta situação como membro da staff."
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white focus:ring-[#00E5FF]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      O que você acredita que pode contribuir para o Tokyo Edge RP? <span className="text-[#FF0A54]">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Descreva suas habilidades e como você pode contribuir para o servidor."
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white focus:ring-[#00E5FF]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Informações adicionais (opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Compartilhe qualquer informação adicional que você acredita ser relevante."
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white focus:ring-[#00E5FF]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Termos e Envio */}
          <div className="pt-4 border-t border-[#2D2D2D]">
            <FormField
              control={form.control}
              name="termsAgreed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-[#00E5FF] data-[state=checked]:text-black"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-gray-300">
                      Eu confirmo que todas as informações fornecidas são verdadeiras e concordo com os <Link href="/terms"><a className="text-[#00E5FF] hover:underline">Termos de Serviço</a></Link> e <Link href="/privacy"><a className="text-[#00E5FF] hover:underline">Política de Privacidade</a></Link> do Tokyo Edge RP. <span className="text-[#FF0A54]">*</span>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cyberpunk-btn px-8 py-3 rounded bg-[#FF0A54] text-white font-rajdhani font-bold text-lg hover:shadow-[0_0_15px_rgba(255,10,84,0.7)] transition-all"
              >
                {isSubmitting ? "ENVIANDO..." : "ENVIAR APLICAÇÃO"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ApplicationForm;
