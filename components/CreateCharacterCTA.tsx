import React from 'react';
import { Link } from 'wouter';

export function CreateCharacterCTA() {
  return (
    <section id="create" className="py-12 px-4 bg-maroon/90 text-parchment">
      <div className="container mx-auto text-center">
        <h2 className="font-medieval text-3xl md:text-4xl mb-4">Crie Seu Herói</h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Escreva sua própria lenda no mundo de Eldoria. Forje um personagem único e embarque em aventuras épicas.
        </p>
        <Link href="/create">
          <a className="inline-block bg-gold hover:bg-yellow-600 text-darkBrown px-8 py-3 rounded-md font-medieval text-lg transition-colors duration-200 shadow-lg">
            Começar Criação
          </a>
        </Link>
      </div>
    </section>
  );
}
