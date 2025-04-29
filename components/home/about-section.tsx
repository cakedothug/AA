import React from "react";
import { motion } from "framer-motion";

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-[#121212]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-[#FF0A54] rounded-lg blur-lg opacity-50 z-0"></div>
              <div className="relative z-10 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1567942712661-82b9b407abbf?auto=format&fit=crop&w=800&q=80" 
                  alt="Tokyo Edge Roleplay" 
                  className="w-full rounded-lg" 
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-rajdhani font-bold text-white mb-4">
              Sobre o <span className="text-[#00E5FF]">Tokyo Edge</span> RP
            </h2>
            
            <p className="text-gray-300 mb-4">
              O Tokyo Edge Roleplay é um servidor brasileiro de GTA V focado em proporcionar uma experiência de jogo imersiva e realista. Nossa comunidade é formada por jogadores apaixonados por roleplay que buscam vivenciar histórias únicas em um ambiente urbano dinâmico.
            </p>
            
            <p className="text-gray-300 mb-6">
              Com um mapa customizado, economia balanceada e sistemas exclusivos, o Tokyo Edge oferece infinitas possibilidades para os jogadores. Seja como um policial honesto, um empresário bem-sucedido ou um criminoso astuto - seu personagem, sua história.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glassmorphism p-4 rounded-lg border-l-2 border-[#00E5FF]">
                <h3 className="text-lg font-rajdhani font-bold text-white mb-2">
                  Nossa Missão
                </h3>
                <p className="text-gray-400 text-sm">
                  Criar um ambiente de roleplay imersivo e acolhedor, onde jogadores possam desenvolver histórias cativantes e criar memórias inesquecíveis.
                </p>
              </div>
              
              <div className="glassmorphism p-4 rounded-lg border-l-2 border-[#FF0A54]">
                <h3 className="text-lg font-rajdhani font-bold text-white mb-2">
                  Nossa Visão
                </h3>
                <p className="text-gray-400 text-sm">
                  Ser reconhecido como o melhor servidor de roleplay brasileiro, estabelecendo novos padrões de qualidade, inovação e experiência de jogo.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
