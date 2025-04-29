import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Region } from '@shared/schema';

export function WorldSection() {
  const { data: regions, isLoading, error } = useQuery<Region[]>({
    queryKey: ['/api/regions'],
  });

  return (
    <section id="world" className="py-12 px-4 bg-darkBrown/10">
      <div className="container mx-auto">
        <h2 className="font-medieval text-3xl md:text-4xl mb-8 text-center text-maroon">O Mundo de Eldoria</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="font-medieval text-2xl mb-4 text-darkBrown">O Reino e suas Terras</h3>
            <p className="mb-4">
              Eldoria é um vasto continente dividido em vários reinos e territórios, cada um com sua própria cultura, 
              política e perigos. Das florestas encantadas de Sylvanor até as áridas Terras de Ferron, aventureiros 
              encontram infinitas oportunidades para glória, fortuna e desafios.
            </p>
            <p>
              O mundo está em constante mudança, com antigas alianças sendo quebradas e novas ameaças surgindo das 
              sombras. É um tempo de heróis e vilões, onde suas ações podem mudar o destino de reinos inteiros.
            </p>
          </div>
          
          <div className="relative h-64 md:h-auto">
            <img 
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Mapa de Eldoria" 
              className="w-full h-full object-cover rounded-lg shadow-lg border-2 border-gold"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg"></div>
            <div className="absolute bottom-4 left-4 text-white font-medieval text-xl">Mapa do Reino</div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            Ocorreu um erro ao carregar as regiões.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions && regions.map((region) => (
              <div key={region.id} className="bg-parchment rounded-lg overflow-hidden shadow-lg border border-gold">
                <img 
                  src={region.imageUrl} 
                  alt={region.name} 
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medieval text-xl text-maroon mb-2">{region.name}</h3>
                  <p className="text-sm mb-3">{region.description}</p>
                  <button className="w-full bg-darkBrown hover:bg-darkBrown/80 text-gold py-1 rounded-sm text-sm font-medieval">
                    Explorar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
