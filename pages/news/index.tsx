import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NewsCard from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
  } | null;
}

interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
}

const NewsIndex: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  // Buscar categorias
  const { data: categoriesData } = useQuery<{categories: NewsCategory[]}>({
    queryKey: ["/api/news/categories"],
    select: (data) => data,
  });

  // Buscar notícias
  const { data: newsData, isLoading } = useQuery<{articles: NewsArticle[]}>({
    queryKey: ["/api/news", page, selectedCategory],
    queryFn: async () => {
      const categoryParam = selectedCategory ? `&category=${selectedCategory}` : "";
      const response = await fetch(`/api/news?limit=${itemsPerPage}&offset=${(page - 1) * itemsPerPage}${categoryParam}`);
      if (!response.ok) throw new Error("Erro ao carregar notícias");
      return response.json();
    },
  });

  // Filtrar por pesquisa (client-side)
  const filteredNews = newsData?.articles?.filter(article => 
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  // Navegar para próxima/anterior página
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (newsData?.articles && newsData.articles.length === itemsPerPage) {
      setPage(page + 1);
    }
  };

  // Resetar filtros
  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setPage(1);
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-rajdhani font-bold text-white mb-4">
            <span className="text-[#00E5FF]">Notícias</span> e Atualizações
          </h1>
          <p className="text-gray-300 max-w-3xl">
            Fique por dentro das últimas notícias, eventos e atualizações do Tokyo Edge RP. 
            Acompanhe nosso desenvolvimento e participe das novidades do servidor.
          </p>
        </motion.div>

        {/* Filtros */}
        <motion.div 
          className="glassmorphism p-4 rounded-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Pesquisar notícias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1A1A1A] border-[#2D2D2D] text-white w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categoriesData?.categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  style={{
                    backgroundColor: selectedCategory === category.id ? category.color : "transparent",
                    borderColor: category.color,
                    color: selectedCategory === category.id ? "#000" : category.color
                  }}
                  className="text-sm"
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                >
                  {category.name}
                </Button>
              ))}
              <Button variant="ghost" className="text-sm" onClick={handleResetFilters}>
                Limpar filtros
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Listagem de Notícias */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="glassmorphism rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNews && filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <NewsCard article={article} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glassmorphism p-8 rounded-lg text-center">
            <p className="text-gray-300 mb-4">Nenhuma notícia encontrada com os filtros atuais.</p>
            <Button onClick={handleResetFilters} variant="outline" className="border-[#00E5FF] text-[#00E5FF]">
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Paginação */}
        {filteredNews && filteredNews.length > 0 && (
          <div className="flex justify-center mt-10">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="border-[#2D2D2D] text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-[#2D2D2D] text-white"
                disabled
              >
                Página {page}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={filteredNews.length < itemsPerPage}
                className="border-[#2D2D2D] text-white disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsIndex;
