import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NewsCard from "@/components/news/news-card";

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

const NewsSection: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/news/featured"],
    select: (data) => data.articles as NewsArticle[],
  });

  return (
    <section className="py-16 bg-[#121212]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-rajdhani font-bold text-white">
              Últimas <span className="text-[#00E5FF]">Notícias</span>
            </h2>
            <p className="text-gray-400 mt-2">
              Fique por dentro das novidades e atualizações do servidor
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/news">
              <a className="mt-4 md:mt-0 inline-flex items-center text-[#00E5FF] hover:text-[#00E5FF]/80 font-medium">
                Ver todas as notícias
                <ChevronRight className="h-5 w-5 ml-1" />
              </a>
            </Link>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Skeleton loading state
            Array(3).fill(0).map((_, index) => (
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
            ))
          ) : data && data.length > 0 ? (
            // Actual news cards
            data.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <NewsCard article={article} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-400">Nenhuma notícia disponível no momento.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
