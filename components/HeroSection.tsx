import React from 'react';
import { Link } from 'wouter';

export function HeroSection() {
  return (
    <section className="py-12 md:py-20 px-4 relative">
      <div className="container mx-auto text-center">
        <h2 className="font-medieval text-4xl md:text-6xl mb-4 text-maroon">Bem-vindo à Terra de Eldoria</h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Embarque em uma jornada épica através de reinos místicos, batalhas heroicas e aventuras inesquecíveis.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link href="#characters">
            <a className="bg-maroon hover:bg-red-900 text-gold px-6 py-3 rounded-md font-medieval text-lg transition-colors duration-200 shadow-lg">
              Explorar Personagens
            </a>
          </Link>
          <Link href="#create">
            <a className="bg-gold hover:bg-yellow-600 text-darkBrown px-6 py-3 rounded-md font-medieval text-lg transition-colors duration-200 shadow-lg">
              Criar Personagem
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
