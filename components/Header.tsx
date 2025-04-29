import React from "react";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="bg-darkBrown text-gold p-4 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <Link href="/">
          <h1 className="font-medieval text-3xl md:text-4xl cursor-pointer">Reino de Aventuras</h1>
        </Link>
        <nav className="mt-4 md:mt-0">
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <a className="hover:text-white transition-colors duration-200 flex items-center">
                  <i className="fas fa-home mr-2"></i> Início
                </a>
              </Link>
            </li>
            <li>
              <Link href="/#characters">
                <a className="hover:text-white transition-colors duration-200 flex items-center">
                  <i className="fas fa-users mr-2"></i> Personagens
                </a>
              </Link>
            </li>
            <li>
              <Link href="/#world">
                <a className="hover:text-white transition-colors duration-200 flex items-center">
                  <i className="fas fa-globe mr-2"></i> Mundo
                </a>
              </Link>
            </li>
            <li>
              <Link href="/#rules">
                <a className="hover:text-white transition-colors duration-200 flex items-center">
                  <i className="fas fa-book mr-2"></i> Regras
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
