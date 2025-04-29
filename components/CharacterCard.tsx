import React from 'react';
import { Link } from 'wouter';
import { StatBar } from '@/components/ui/stat-bar';
import { Character } from '@shared/schema';
import { CLASS_COLORS } from '@/lib/constants';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const {
    id,
    name,
    title,
    class: characterClass,
    level,
    imageUrl,
    stats,
  } = character;

  // Get the color based on class or use default
  const colorClass = CLASS_COLORS[characterClass as keyof typeof CLASS_COLORS]?.primary || CLASS_COLORS.default.primary;

  return (
    <div className="character-card bg-parchment rounded-lg overflow-hidden shadow-lg border-2 border-gold">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={`${name}, ${title}`} 
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-0 right-0 bg-maroon text-gold py-1 px-3 rounded-bl-lg font-medieval">
          Nível {level}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medieval text-2xl text-maroon">
            {name}
            {title && <span>, {title}</span>}
          </h3>
          <span className="bg-gold/20 text-darkBrown px-2 py-1 rounded text-sm">
            {characterClass}
          </span>
        </div>
        <p className="mb-4 text-sm">
          {character.background ? 
            character.background.substring(0, 120) + '...' : 
            'Um aventureiro em busca de glória e fortuna.'}
        </p>
        
        <div className="space-y-2 mb-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Força</span>
              <span>{Math.round((stats.strength / 20) * 100)}%</span>
            </div>
            <StatBar value={(stats.strength / 20) * 100} colorClass={colorClass} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Destreza</span>
              <span>{Math.round((stats.dexterity / 20) * 100)}%</span>
            </div>
            <StatBar value={(stats.dexterity / 20) * 100} colorClass={colorClass} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Inteligência</span>
              <span>{Math.round((stats.intelligence / 20) * 100)}%</span>
            </div>
            <StatBar value={(stats.intelligence / 20) * 100} colorClass={colorClass} />
          </div>
        </div>
        
        <Link href={`/characters/${id}`}>
          <button className="w-full bg-darkBrown hover:bg-darkBrown/80 text-gold py-2 rounded transition-colors duration-200 font-medieval">
            Ver Detalhes
          </button>
        </Link>
      </div>
    </div>
  );
}
