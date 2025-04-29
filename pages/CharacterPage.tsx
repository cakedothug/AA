import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Character } from '@shared/schema';
import { Header } from '@/components/Header';
import { CharacterDetail } from '@/components/CharacterDetail';
import { Footer } from '@/components/Footer';

export default function CharacterPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: character, isLoading, error } = useQuery<Character>({
    queryKey: [`/api/characters/${id}`],
  });

  return (
    <div className="bg-parchment font-body text-textBrown bg-parchment-texture min-h-screen">
      <Header />
      
      <div className="py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
          </div>
        ) : error ? (
          <div className="container mx-auto px-4 text-center">
            <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-medieval mb-2">Ocorreu um erro!</h2>
              <p>Não foi possível carregar os detalhes do personagem.</p>
            </div>
          </div>
        ) : character ? (
          <CharacterDetail character={character} />
        ) : (
          <div className="container mx-auto px-4 text-center">
            <div className="bg-yellow-100 text-yellow-700 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-medieval mb-2">Personagem não encontrado</h2>
              <p>Este personagem não existe ou foi removido.</p>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
