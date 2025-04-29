import React from 'react';
import { Link, useLocation } from 'wouter';
import { StatBar } from '@/components/ui/stat-bar';
import { Character, CharacterSkill, CharacterEquipment, CharacterRelation } from '@shared/schema';
import { CLASS_COLORS } from '@/lib/constants';

interface CharacterDetailProps {
  character: Character;
}

export function CharacterDetail({ character }: CharacterDetailProps) {
  const [, setLocation] = useLocation();
  
  // Early return if no character
  if (!character) return null;

  const {
    name,
    title,
    class: characterClass,
    race,
    level,
    alignment,
    age,
    origin,
    background,
    imageUrl,
    stats,
    skills,
    equipment,
    relations,
    currentXp,
    nextLevelXp
  } = character;

  // Calculate the XP percentage
  const xpPercentage = (currentXp / nextLevelXp) * 100;
  
  // Get the color based on class or use default
  const colorClass = CLASS_COLORS[characterClass as keyof typeof CLASS_COLORS]?.primary || CLASS_COLORS.default.primary;

  const handleClose = () => {
    setLocation('/#characters');
  };

  return (
    <section id="character-detail" className="py-12 px-4">
      <div className="container mx-auto">
        <div className="bg-parchment p-6 md:p-8 rounded-lg shadow-lg border-2 border-gold scroll-border">
          <div className="flex justify-between items-start mb-6">
            <h2 className="font-medieval text-3xl text-maroon">
              {name}
              {title && <span>, {title}</span>}
            </h2>
            <button 
              className="text-darkBrown hover:text-maroon"
              onClick={handleClose}
            >
              <i className="fas fa-times-circle text-2xl"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Character Image and Basic Info */}
            <div>
              <div className="relative mb-4">
                <img 
                  src={imageUrl} 
                  alt={`${name}, ${title}`} 
                  className="w-full h-auto rounded-lg border-2 border-gold shadow-lg"
                />
                <div className="absolute top-2 right-2 bg-maroon text-gold py-1 px-3 rounded font-medieval">
                  Nível {level}
                </div>
              </div>
              
              <div className="bg-gold/10 p-4 rounded-lg border border-gold/30 mb-4">
                <h3 className="font-medieval text-xl mb-2 text-darkBrown">Informações Básicas</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="font-semibold">Raça:</span>
                    <span>{race}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-semibold">Classe:</span>
                    <span>{characterClass}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-semibold">Alinhamento:</span>
                    <span>{alignment}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-semibold">Idade:</span>
                    <span>{age} anos</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-semibold">Origem:</span>
                    <span>{origin}</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gold/10 p-4 rounded-lg border border-gold/30">
                <h3 className="font-medieval text-xl mb-2 text-darkBrown">Equipamento</h3>
                <ul className="space-y-1 text-sm">
                  {(equipment as CharacterEquipment[]).map((item, index) => (
                    <li key={index} className="flex items-center">
                      <i className={`fas fa-${getEquipmentIcon(item.type)} text-maroon mr-2`}></i>
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Character Stats and Skills */}
            <div>
              <div className="bg-gold/10 p-4 rounded-lg border border-gold/30 mb-4">
                <h3 className="font-medieval text-xl mb-4 text-darkBrown">Atributos</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-parchment p-3 rounded text-center border border-gold/50">
                    <div className="font-medieval text-2xl text-maroon">{stats.strength}</div>
                    <div className="text-xs uppercase tracking-wide">Força</div>
                  </div>
                  <div className="bg-parchment p-3 rounded text-center border border-gold/50">
                    <div className="font-medieval text-2xl text-maroon">{stats.dexterity}</div>
                    <div className="text-xs uppercase tracking-wide">Destreza</div>
                  </div>
                  <div className="bg-parchment p-3 rounded text-center border border-gold/50">
                    <div className="font-medieval text-2xl text-maroon">{stats.constitution}</div>
                    <div className="text-xs uppercase tracking-wide">Constituição</div>
                  </div>
                  <div className="bg-parchment p-3 rounded text-center border border-gold/50">
                    <div className="font-medieval text-2xl text-maroon">{stats.intelligence}</div>
                    <div className="text-xs uppercase tracking-wide">Inteligência</div>
                  </div>
                  <div className="bg-parchment p-3 rounded text-center border border-gold/50">
                    <div className="font-medieval text-2xl text-maroon">{stats.wisdom}</div>
                    <div className="text-xs uppercase tracking-wide">Sabedoria</div>
                  </div>
                  <div className="bg-parchment p-3 rounded text-center border border-gold/50">
                    <div className="font-medieval text-2xl text-maroon">{stats.charisma}</div>
                    <div className="text-xs uppercase tracking-wide">Carisma</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gold/10 p-4 rounded-lg border border-gold/30 mb-4">
                <h3 className="font-medieval text-xl mb-2 text-darkBrown">Habilidades</h3>
                
                <div className="space-y-3">
                  {(skills as CharacterSkill[]).map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{skill.name}</span>
                        <span className="text-xs bg-maroon text-gold px-2 py-1 rounded">{skill.level}</span>
                      </div>
                      <StatBar value={skill.value} colorClass={colorClass} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gold/10 p-4 rounded-lg border border-gold/30">
                <h3 className="font-medieval text-xl mb-2 text-darkBrown">Progressão</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Experiência</span>
                    <span>{currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()}</span>
                  </div>
                  <StatBar value={xpPercentage} colorClass="from-gold to-yellow-600" />
                </div>
                <div className="text-xs text-center mt-2">
                  {Math.round(100 - xpPercentage)}% para o nível {level + 1}
                </div>
              </div>
            </div>
            
            {/* Character Background and Interactions */}
            <div>
              <div className="bg-gold/10 p-4 rounded-lg border border-gold/30 mb-4">
                <h3 className="font-medieval text-xl mb-2 text-darkBrown">História</h3>
                <p className="text-sm whitespace-pre-line">
                  {background}
                </p>
              </div>
              
              {relations && relations.length > 0 && (
                <div className="bg-gold/10 p-4 rounded-lg border border-gold/30 mb-4">
                  <h3 className="font-medieval text-xl mb-2 text-darkBrown">Relações</h3>
                  <ul className="space-y-2 text-sm">
                    {(relations as CharacterRelation[]).map((relation, index) => (
                      <li key={index} className="flex items-start">
                        {relation.imageUrl && (
                          <img 
                            src={relation.imageUrl} 
                            alt={relation.name} 
                            className="w-10 h-10 rounded-full mr-3 object-cover border border-gold"
                          />
                        )}
                        <div>
                          <div className="font-semibold">{relation.name}</div>
                          <div className="text-xs">
                            {relation.type === 'ally' ? 'Aliado' : 'Inimigo'} • Relação: {relation.description}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="bg-gold/10 p-4 rounded-lg border border-gold/30">
                <h3 className="font-medieval text-xl mb-4 text-darkBrown">Ações</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-maroon hover:bg-maroon/80 text-gold py-2 px-4 rounded font-medieval text-sm">
                    <i className="fas fa-comments mr-1"></i> Interagir
                  </button>
                  <button className="bg-darkBrown hover:bg-darkBrown/80 text-gold py-2 px-4 rounded font-medieval text-sm">
                    <i className="fas fa-dice-d20 mr-1"></i> Rolar Dados
                  </button>
                  <button className="bg-green-800 hover:bg-green-900 text-gold py-2 px-4 rounded font-medieval text-sm">
                    <i className="fas fa-heart mr-1"></i> Curar
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-800 text-gold py-2 px-4 rounded font-medieval text-sm">
                    <i className="fas fa-edit mr-1"></i> Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper function to get the appropriate icon for equipment type
function getEquipmentIcon(type: string): string {
  switch (type) {
    case 'weapon': return 'sword';
    case 'shield': return 'shield-alt';
    case 'armor': return 'tshirt';
    case 'accessory': return 'ring';
    case 'consumable': return 'flask';
    default: return 'scroll';
  }
}
