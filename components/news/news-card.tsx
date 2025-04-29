import React from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

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

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <Card className="glassmorphism rounded-lg overflow-hidden card-hover border-none">
      <div className="h-48 relative">
        <img 
          src={article.coverImage} 
          alt={article.title} 
          className="w-full h-full object-cover"
        />
        {article.category && (
          <div 
            className="absolute top-3 left-3 text-white text-xs font-medium px-2 py-1 rounded"
            style={{ backgroundColor: article.category.color || '#00E5FF' }}
          >
            {article.category.name}
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex items-center text-sm text-white/60 mb-2">
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        <h3 className="text-xl font-rajdhani font-bold text-white mb-2 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-white/70 mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        <Link href={`/news/${article.slug}`}>
          <a className="text-[#00E5FF] font-medium hover:text-[#00E5FF]/80 transition-colors inline-flex items-center">
            Ler Mais
            <ChevronRight className="h-4 w-4 ml-1" />
          </a>
        </Link>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
