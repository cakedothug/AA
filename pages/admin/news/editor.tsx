import React from "react";
import { useLocation, useParams, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Users, 
  FileText, 
  UserCheck, 
  Settings, 
  ExternalLink, 
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import NewsEditor from "@/components/admin/news-editor";

const AdminNewsEditorPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const [match] = useRoute("/admin/news/edit/:id");
  
  const isEditMode = !!match;
  const articleId = isEditMode ? parseInt(params?.id || "0") : undefined;

  // Redirecionar se não estiver autenticado ou não for admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (!isAdmin) {
      setLocation("/");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  const handleEditorSuccess = (slug: string) => {
    setLocation(`/news/${slug}`);
  };

  // Se não estiver autenticado como admin, não renderiza o conteúdo
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#121212]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-[#1A1A1A] border-r border-[#2D2D2D] overflow-y-auto hidden md:block">
        <div className="p-6">
          <Link href="/">
            <a className="font-rajdhani font-bold text-2xl">
              <span className="text-white">TOKYO</span>
              <span className="text-[#00E5FF]">EDGE</span>
              <span className="text-[#FF0A54]">RP</span>
            </a>
          </Link>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Administração
            </p>
          </div>
          
          <Link href="/admin/dashboard">
            <a className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]">
              <Users className="h-5 w-5 mr-3" />
              Dashboard
            </a>
          </Link>
          
          <Link href="/admin/applications">
            <a className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]">
              <UserCheck className="h-5 w-5 mr-3" />
              Aplicações
            </a>
          </Link>
          
          <Link href="/admin/news">
            <a className="flex items-center px-6 py-3 text-white bg-[#FF0A54]/10 border-l-2 border-[#FF0A54]">
              <FileText className="h-5 w-5 mr-3" />
              Notícias
            </a>
          </Link>
          
          <Link href="/admin/settings">
            <a className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]">
              <Settings className="h-5 w-5 mr-3" />
              Configurações
            </a>
          </Link>
          
          <div className="px-4 py-2 mt-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Acessos Rápidos
            </p>
          </div>
          
          <a 
            href="https://discord.gg/NZAAaAmQtC" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]"
          >
            <ExternalLink className="h-5 w-5 mr-3" />
            Discord
          </a>
          
          <Link href="/">
            <a className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]">
              <ExternalLink className="h-5 w-5 mr-3" />
              Ver Site
            </a>
          </Link>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Link href="/admin/news">
              <a className="mr-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white hover:bg-[#2D2D2D]"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </a>
            </Link>
            <div>
              <h1 className="text-3xl font-rajdhani font-bold text-white">
                {isEditMode ? "Editar Notícia" : "Nova Notícia"}
              </h1>
              <p className="text-gray-400">
                {isEditMode ? "Atualize esta notícia" : "Crie uma nova notícia para o site"}
              </p>
            </div>
          </div>
          
          <div className="glassmorphism p-6 rounded-lg">
            <NewsEditor 
              articleId={articleId} 
              onSuccess={handleEditorSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsEditorPage;
