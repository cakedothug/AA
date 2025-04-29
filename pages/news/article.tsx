import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, User } from "lucide-react";

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
  } | null;
  author: {
    id: number;
    username: string;
    avatar?: string;
  } | null;
}

const NewsArticle: React.FC = () => {
  const [, params] = useRoute("/news/:slug");
  const slug = params?.slug;

  const { data: article, isLoading, error } = useQuery<{article: NewsArticle}>({
    queryKey: [`/api/news/${slug}`],
    enabled: !!slug,
    select: (data) => data,
  });

  if (error) {
    return (
      <div className="py-12 container mx-auto px-4">
        <div className="glassmorphism p-8 rounded-lg text-center">
          <h1 className="text-2xl font-rajdhani font-bold text-white mb-4">
            Erro ao carregar a notícia
          </h1>
          <p className="text-gray-300 mb-6">
            Não foi possível carregar a notícia solicitada. Por favor, tente novamente mais tarde.
          </p>
          <Link href="/news">
            <Button className="bg-[#00E5FF] text-black hover:bg-[#00E5FF]/80">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar para notícias
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Botão Voltar */}
        <Link href="/news">
          <Button variant="ghost" className="text-white mb-6 hover:bg-[#1A1A1A]">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para notícias
          </Button>
        </Link>

        {isLoading ? (
          <div className="glassmorphism rounded-lg overflow-hidden">
            <Skeleton className="h-72 w-full" />
            <div className="p-8">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex gap-6 mb-8">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ) : article ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glassmorphism rounded-lg overflow-hidden"
          >
            {/* Imagem de capa */}
            <div className="relative h-72 md:h-96">
              <img 
                src={article.article.coverImage} 
                alt={article.article.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-80"></div>
              
              {/* Categoria */}
              {article.article.category && (
                <div 
                  className="absolute top-4 left-4 text-white text-sm font-medium px-3 py-1 rounded-full"
                  style={{ backgroundColor: article.article.category.color }}
                >
                  {article.article.category.name}
                </div>
              )}
            </div>

            {/* Conteúdo */}
            <div className="p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-rajdhani font-bold text-white mb-4">
                {article.article.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(article.article.publishedAt)}</span>
                </div>
                
                {article.article.author && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{article.article.author.username}</span>
                  </div>
                )}
              </div>
              
              <div 
                className="text-gray-300 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: article.article.content }}
              />
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default NewsArticle;
