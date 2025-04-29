// Character classes with their associated colors
export const CLASS_COLORS = {
  Guerreiro: {
    primary: 'from-maroon to-red-700',
    badge: 'bg-red-100 text-red-800'
  },
  Mago: {
    primary: 'from-indigo-600 to-purple-700',
    badge: 'bg-indigo-100 text-indigo-800'
  },
  Arqueiro: {
    primary: 'from-green-600 to-green-800',
    badge: 'bg-green-100 text-green-800'
  },
  Ladino: {
    primary: 'from-gray-600 to-gray-800',
    badge: 'bg-gray-100 text-gray-800'
  },
  Clérigo: {
    primary: 'from-yellow-500 to-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  Bárbaro: {
    primary: 'from-orange-600 to-red-800',
    badge: 'bg-orange-100 text-orange-800'
  },
  Bardo: {
    primary: 'from-pink-500 to-purple-600',
    badge: 'bg-pink-100 text-pink-800'
  },
  Druida: {
    primary: 'from-emerald-600 to-green-800',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  default: {
    primary: 'from-blue-600 to-blue-800',
    badge: 'bg-blue-100 text-blue-800'
  }
};

// Character skill level mappings
export const SKILL_LEVELS = {
  Iniciante: { min: 0, max: 20 },
  Básico: { min: 21, max: 40 },
  Competente: { min: 41, max: 60 },
  Avançado: { min: 61, max: 80 },
  Mestre: { min: 81, max: 100 }
};

// Character races
export const RACES = [
  'Humano',
  'Elfo',
  'Anão',
  'Halfling',
  'Meio-Elfo',
  'Meio-Orc',
  'Gnomo',
  'Draconato',
  'Tiefling'
];

// Character alignments
export const ALIGNMENTS = [
  'Leal Bom',
  'Neutro Bom',
  'Caótico Bom',
  'Leal Neutro',
  'Neutro',
  'Caótico Neutro',
  'Leal Mau',
  'Neutro Mau',
  'Caótico Mau'
];
