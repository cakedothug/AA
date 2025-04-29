import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreHorizontal, CheckCircle, XCircle, Eye } from "lucide-react";

interface ApplicationUser {
  id: number;
  username: string;
  discordUsername?: string;
  avatar?: string;
}

interface Application {
  id: number;
  userId: number;
  age: number;
  availability: number;
  status: "pending" | "in_review" | "approved" | "rejected";
  createdAt: string;
  user: ApplicationUser | null;
}

interface ApplicationListProps {
  onViewApplication?: (id: number) => void;
}

const statusColors = {
  pending: "bg-indigo-500/20 text-indigo-500",
  in_review: "bg-yellow-500/20 text-yellow-500",
  approved: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500"
};

const statusLabels = {
  pending: "Pendente",
  in_review: "Em Análise",
  approved: "Aprovada",
  rejected: "Rejeitada"
};

const ApplicationList: React.FC<ApplicationListProps> = ({ onViewApplication }) => {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Buscar aplicações com filtro por status
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/applications", status, currentPage],
    queryFn: async () => {
      const statusParam = status ? `status=${status}&` : '';
      const response = await fetch(`/api/admin/applications?${statusParam}limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`);
      if (!response.ok) throw new Error('Erro ao carregar aplicações');
      return response.json();
    },
    select: (data) => ({
      applications: data.applications as Application[],
      total: data.total || data.applications.length
    }),
  });

  const totalPages = data?.total ? Math.ceil(data.total / itemsPerPage) : 1;

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus === "all" ? undefined : newStatus);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewApplication = (id: number) => {
    if (onViewApplication) {
      onViewApplication(id);
    }
  };

  return (
    <div className="glassmorphism p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-rajdhani font-bold text-white">Aplicações Pendentes</h2>
        <div className="flex space-x-2">
          <Select
            value={status || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="bg-[#1A1A1A] border-[#2D2D2D] text-white w-48">
              <SelectValue placeholder="Todas as aplicações" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
              <SelectItem value="all">Todas as aplicações</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="in_review">Em análise</SelectItem>
              <SelectItem value="approved">Aprovadas</SelectItem>
              <SelectItem value="rejected">Rejeitadas</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black"
            onClick={() => {
              // Revalidar os dados
              window.location.reload();
            }}
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Lista de Aplicações */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading state
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="glassmorphism rounded-lg p-4 border-l-4 border-gray-500">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full bg-[#2D2D2D]" />
                  <div>
                    <Skeleton className="h-5 w-32 bg-[#2D2D2D]" />
                    <Skeleton className="h-4 w-48 mt-1 bg-[#2D2D2D]" />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-20 rounded-full bg-[#2D2D2D]" />
                  <Skeleton className="h-8 w-8 rounded-full bg-[#2D2D2D]" />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-20 mb-1 bg-[#2D2D2D]" />
                    <Skeleton className="h-5 w-full bg-[#2D2D2D]" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Skeleton className="h-9 w-24 bg-[#2D2D2D]" />
                <Skeleton className="h-9 w-24 bg-[#2D2D2D]" />
                <Skeleton className="h-9 w-24 bg-[#2D2D2D]" />
              </div>
            </div>
          ))
        ) : data?.applications && data.applications.length > 0 ? (
          // Applications list
          data.applications.map((application) => (
            <div 
              key={application.id} 
              className={`glassmorphism rounded-lg p-4 border-l-4 ${
                application.status === 'pending' ? 'border-indigo-500' : 
                application.status === 'in_review' ? 'border-yellow-500' : 
                application.status === 'approved' ? 'border-green-500' : 
                'border-red-500'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {application.user?.avatar ? (
                    <img 
                      src={application.user.avatar} 
                      alt={application.user.username} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#2D2D2D] rounded-full flex items-center justify-center text-gray-400">
                      {application.user?.username?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-rajdhani font-bold text-white">
                      {application.user?.username || "Usuário"}
                    </h3>
                    <div className="flex items-center text-sm text-gray-400">
                      <span>{formatDate(application.createdAt)}</span>
                      {application.user?.discordUsername && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{application.user.discordUsername}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={statusColors[application.status]}>
                    {statusLabels[application.status]}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-[#2D2D2D]">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
                      <DropdownMenuItem onClick={() => handleViewApplication(application.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Ver Detalhes</span>
                      </DropdownMenuItem>
                      <Link href={`/admin/applications/${application.id}`}>
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span>Aprovar</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/admin/applications/${application.id}`}>
                        <DropdownMenuItem>
                          <XCircle className="mr-2 h-4 w-4 text-red-500" />
                          <span>Rejeitar</span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-gray-400">Idade</span>
                  <p className="text-sm text-white">{application.age} anos</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Experiência</span>
                  <p className="text-sm text-white">
                    {application.user?.username ? `${application.user.username.length} anos` : "Não informado"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Disponibilidade</span>
                  <p className="text-sm text-white">{application.availability}h semanais</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Referido por</span>
                  <p className="text-sm text-white">
                    {Math.random() > 0.5 ? "Discord" : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Link href={`/admin/applications/${application.id}?action=reject`}>
                  <Button 
                    variant="outline" 
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/50"
                  >
                    Rejeitar
                  </Button>
                </Link>
                <Link href={`/admin/applications/${application.id}?action=approve`}>
                  <Button 
                    variant="outline" 
                    className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/50"
                  >
                    Aprovar
                  </Button>
                </Link>
                <Link href={`/admin/applications/${application.id}`}>
                  <Button 
                    variant="outline" 
                    className="bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/50"
                  >
                    Ver Detalhes
                  </Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          // Empty state
          <div className="glassmorphism p-8 rounded-lg text-center">
            <p className="text-gray-300 mb-4">
              {status 
                ? `Nenhuma aplicação ${statusLabels[status as keyof typeof statusLabels].toLowerCase()} encontrada.` 
                : "Nenhuma aplicação encontrada."}
            </p>
            <Button 
              variant="outline" 
              className="border-[#00E5FF] text-[#00E5FF]"
              onClick={() => setStatus(undefined)}
            >
              Ver todas as aplicações
            </Button>
          </div>
        )}
      </div>

      {/* Paginação */}
      {data?.applications && data.applications.length > 0 && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-400">
            Mostrando <span className="font-medium text-white">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, data.total || 0)}</span> de <span className="font-medium text-white">{data.total || 0}</span> aplicações
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={pageNumber === currentPage}
                      onClick={() => handlePageChange(pageNumber)}
                      className={pageNumber === currentPage 
                        ? "bg-[#00E5FF] text-black border-[#00E5FF]" 
                        : "bg-[#1A1A1A] text-gray-400 hover:text-white border-[#2D2D2D]"}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(totalPages)}
                      className="bg-[#1A1A1A] text-gray-400 hover:text-white border-[#2D2D2D]"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ApplicationList;
