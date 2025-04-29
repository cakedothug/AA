import React from 'react';

export function RulesSection() {
  return (
    <section id="rules" className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="font-medieval text-3xl md:text-4xl mb-8 text-center text-maroon">Regras do Reino</h2>
        
        <div className="bg-parchment p-6 rounded-lg shadow-lg border-2 border-gold mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <h3 className="font-medieval text-2xl mb-4 text-darkBrown">Sistema de Jogo</h3>
              <p className="mb-4">
                Nosso mundo usa um sistema simplificado baseado no tradicional d20, com modificações para tornar o jogo 
                mais fluido e adequado para o ambiente online. As principais mecânicas incluem:
              </p>
              
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Testes de atributos com d20 + modificador contra um valor de dificuldade</li>
                <li>Sistema de combate por turnos com ações, movimentos e ações bônus</li>
                <li>Progressão de nível baseada em pontos de experiência</li>
                <li>Sistema de perícias e talentos personalizáveis</li>
              </ul>
              
              <p>
                O Mestre do Jogo (MJ) é o árbitro final das regras e pode fazer ajustes conforme necessário para
                manter o jogo divertido e balanceado para todos os jogadores.
              </p>
            </div>
            
            <div className="md:w-1/2">
              <h3 className="font-medieval text-2xl mb-4 text-darkBrown">Regras de Conduta</h3>
              <p className="mb-4">
                Para garantir uma experiência agradável para todos, seguimos algumas regras básicas de conduta:
              </p>
              
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Respeite todos os jogadores e suas criações</li>
                <li>Mantenha-se fiel ao seu personagem e sua história</li>
                <li>Evite metagaming (usar conhecimento do jogador que o personagem não teria)</li>
                <li>Siga as orientações do Mestre do Jogo</li>
                <li>Avise com antecedência se não puder participar de uma sessão</li>
                <li>Contribua positivamente para a história e o mundo compartilhado</li>
              </ul>
              
              <p>
                Violações graves ou repetidas dessas regras podem resultar em penalidades ou remoção do grupo, 
                a critério dos administradores.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-parchment p-5 rounded-lg shadow-lg border border-gold">
            <div className="flex items-center mb-3">
              <i className="fas fa-dice-d20 text-maroon text-2xl mr-3"></i>
              <h3 className="font-medieval text-xl text-darkBrown">Rolagem de Dados</h3>
            </div>
            <p className="text-sm">
              Use o comando /roll seguido do número e tipo de dados (ex: /roll 2d6) para fazer rolagens. 
              Modificadores podem ser adicionados com + ou - (ex: /roll 1d20+5).
            </p>
          </div>
          
          <div className="bg-parchment p-5 rounded-lg shadow-lg border border-gold">
            <div className="flex items-center mb-3">
              <i className="fas fa-comments text-maroon text-2xl mr-3"></i>
              <h3 className="font-medieval text-xl text-darkBrown">Interpretação</h3>
            </div>
            <p className="text-sm">
              Use aspas para fala do personagem, colchetes para ações e parênteses para comentários fora do personagem. 
              Mantenha a coerência com a personalidade e história do seu personagem.
            </p>
          </div>
          
          <div className="bg-parchment p-5 rounded-lg shadow-lg border border-gold">
            <div className="flex items-center mb-3">
              <i className="fas fa-crown text-maroon text-2xl mr-3"></i>
              <h3 className="font-medieval text-xl text-darkBrown">Mestre do Jogo</h3>
            </div>
            <p className="text-sm">
              O MJ tem a palavra final em todas as questões de regras e narrativa. Questões sobre regras devem ser 
              discutidas após a sessão para não interromper o fluxo do jogo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
