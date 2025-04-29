import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Pencil, Trash2, Plus, UserPlus } from "lucide-react";

// Schema para staff member
const staffMemberSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Cargo é obrigatório"),
  position: z.string().min(1, "Posição é obrigatória"),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0, "Ordem deve ser um número positivo"),
  isActive: z.boolean().default(true),
  userId: z.number().optional().nullable(),
  socialLinks: z.object({
    discord: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    twitch: z.string().optional(),
  }).optional(),
});

type StaffMember = z.infer<typeof staffMemberSchema>;

export default function AdminStaffManager() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);

  // Buscar usuários para associar a membros da staff
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Buscar membros da staff
  const { data: staffMembers, isLoading: staffLoading } = useQuery({
    queryKey: ['/api/admin/staff'],
  });

  const form = useForm<StaffMember>({
    resolver: zodResolver(staffMemberSchema),
    defaultValues: {
      name: "",
      role: "",
      position: "",
      bio: "",
      avatar: "",
      displayOrder: 0,
      isActive: true,
      userId: null,
      socialLinks: {
        discord: "",
        twitter: "",
        instagram: "",
        twitch: "",
      },
    },
  });

  // Resetar o formulário com os valores do membro selecionado
  const resetFormWithStaff = (staff: StaffMember) => {
    form.reset({
      name: staff.name,
      role: staff.role,
      position: staff.position,
      bio: staff.bio || "",
      avatar: staff.avatar || "",
      displayOrder: staff.displayOrder,
      isActive: staff.isActive,
      userId: staff.userId,
      socialLinks: staff.socialLinks || {
        discord: "",
        twitter: "",
        instagram: "",
        twitch: "",
      },
    });
  };

  // Mutation para criar membro da staff
  const createStaffMutation = useMutation({
    mutationFn: async (data: StaffMember) => {
      return await apiRequest("POST", "/api/admin/staff", data);
    },
    onSuccess: () => {
      toast({
        title: "Membro adicionado",
        description: "Membro da equipe adicionado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      setIsEditing(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar membro",
        description: error.message || "Ocorreu um erro ao adicionar o membro da equipe",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar membro da staff
  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: StaffMember }) => {
      return await apiRequest("PATCH", `/api/admin/staff/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Membro atualizado",
        description: "Membro da equipe atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      setIsEditing(false);
      setCurrentStaff(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar membro",
        description: error.message || "Ocorreu um erro ao atualizar o membro da equipe",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar membro da staff
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/staff/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Membro removido",
        description: "Membro da equipe removido com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      setIsDeleteDialogOpen(false);
      setStaffToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover membro",
        description: error.message || "Ocorreu um erro ao remover o membro da equipe",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: StaffMember) => {
    if (currentStaff && currentStaff.id) {
      // Edição
      await updateStaffMutation.mutateAsync({ id: currentStaff.id, data });
    } else {
      // Criação
      await createStaffMutation.mutateAsync(data);
    }
  };

  const handleNewStaff = () => {
    setCurrentStaff(null);
    form.reset({
      name: "",
      role: "",
      position: "",
      bio: "",
      avatar: "",
      displayOrder: 0,
      isActive: true,
      userId: null,
      socialLinks: {
        discord: "",
        twitter: "",
        instagram: "",
        twitch: "",
      },
    });
    setIsEditing(true);
  };

  const handleEditStaff = (staff: any) => {
    setCurrentStaff(staff);
    resetFormWithStaff(staff);
    setIsEditing(true);
  };

  const handleDeleteStaff = (id: number) => {
    setStaffToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStaff = async () => {
    if (staffToDelete !== null) {
      await deleteStaffMutation.mutateAsync(staffToDelete);
    }
  };

  const getAvatarFallback = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Equipe</h1>
          <p className="text-muted-foreground">
            Adicione, edite ou remova membros da equipe exibidos no site
          </p>
        </div>
        <Button onClick={handleNewStaff}>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Membro
        </Button>
      </div>

      {/* Lista de membros da equipe */}
      <div className="space-y-6">
        {staffLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-border" />
          </div>
        ) : staffMembers && staffMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffMembers.map((staff: any) => (
              <Card key={staff.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">{staff.name}</CardTitle>
                    <CardDescription>{staff.position}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleEditStaff(staff)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteStaff(staff.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={staff.avatar} alt={staff.name} />
                      <AvatarFallback>{getAvatarFallback(staff.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{staff.role}</p>
                      <p className="text-sm text-muted-foreground">
                        {staff.isActive ? "Ativo" : "Inativo"}
                      </p>
                      {staff.userId && (
                        <p className="text-xs text-muted-foreground">
                          Usuário vinculado
                        </p>
                      )}
                    </div>
                  </div>
                  {staff.bio && (
                    <div className="mt-4">
                      <p className="text-sm line-clamp-3">{staff.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">
                Nenhum membro da equipe cadastrado.
              </p>
              <Button onClick={handleNewStaff}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Membro
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog para edição */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentStaff ? "Editar Membro da Equipe" : "Adicionar Membro da Equipe"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do membro da equipe que será exibido no site.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posição</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Ex: Fundador, Administrador, etc.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Ex: Lider da Staff, Desenvolvedor, etc.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar (URL)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordem de Exibição</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Números menores aparecem primeiro</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário Vinculado</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um usuário (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {!usersLoading && users && users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Vincular a uma conta de usuário</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Status</FormLabel>
                        <FormDescription>
                          Mostrar este membro no site?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(value === "true")}
                          value={field.value ? "true" : "false"}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Ativo</SelectItem>
                            <SelectItem value="false">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Descreva o membro da equipe..." 
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>Uma breve descrição sobre o membro.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label>Redes Sociais</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <FormField
                    control={form.control}
                    name="socialLinks.discord"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <span className="min-w-[80px] text-sm">Discord:</span>
                            <Input {...field} placeholder="Nome#0000" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialLinks.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <span className="min-w-[80px] text-sm">Twitter:</span>
                            <Input {...field} placeholder="@usuário" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialLinks.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <span className="min-w-[80px] text-sm">Instagram:</span>
                            <Input {...field} placeholder="@usuário" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialLinks.twitch"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <span className="min-w-[80px] text-sm">Twitch:</span>
                            <Input {...field} placeholder="canal" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentStaff(null);
                  }}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
                >
                  {(createStaffMutation.isPending || updateStaffMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {currentStaff ? "Atualizar" : "Adicionar"}
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
              Tem certeza que deseja remover este membro da equipe? Esta ação não pode ser desfeita.
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
              onClick={confirmDeleteStaff}
              disabled={deleteStaffMutation.isPending}
            >
              {deleteStaffMutation.isPending && (
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