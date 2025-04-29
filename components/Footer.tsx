import React from 'react';
import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-darkBrown text-gold py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="font-medieval text-2xl mb-2">Reino de Aventuras</h2>
            <p className="text-sm text-gold/80">Um mundo de fantasia e aventuras esperando por você</p>
          </div>
          
          <div className="flex space-x-8">
            <div>
              <h3 className="font-medieval text-lg mb-3">Links</h3>
              <ul className="space-y-2 text-sm text-gold/80">
                <li><Link href="/"><a className="hover:text-white transition-colors duration-200">Início</a></Link></li>
                <li><Link href="/#characters"><a className="hover:text-white transition-colors duration-200">Personagens</a></Link></li>
                <li><Link href="/#world"><a className="hover:text-white transition-colors duration-200">Mundo</a></Link></li>
                <li><Link href="/#rules"><a className="hover:text-white transition-colors duration-200">Regras</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medieval text-lg mb-3">Recursos</h3>
              <ul className="space-y-2 text-sm text-gold/80">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Guia do Iniciante</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Manuais</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Mapa do Mundo</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Calendário</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gold/30 mt-8 pt-6 text-center text-sm text-gold/60">
          <p>&copy; {new Date().getFullYear()} Reino de Aventuras. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
