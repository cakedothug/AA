import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchServerInfo } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Download, 
  PlusCircle, 
  Copy, 
  Gift,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JoinSection: React.FC = () => {
  const { data: serverInfo } = useQuery({
    queryKey: ["/api/settings/public"],
    queryFn: fetchServerInfo,
  });
  
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const handleCopyClick = () => {
    if (serverInfo?.connectionUrl) {
      navigator.clipboard.writeText(serverInfo.connectionUrl);
      setCopied(true);
      
      toast({
        title: "Copiado para a área de transferência",
        description: "Agora é só colar no FiveM!",
        duration: 3000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="join" className="py-16 bg-gradient-to-b from-[#121212] to-[#1E1E1E]">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-rajdhani font-bold text-white mb-4">
            Como <span className="text-[#FF0A54]">Entrar</span> no Servidor
          </h2>
          <p className="text-gray-400">
            Siga estes passos simples para começar sua jornada no Tokyo Edge RP
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div 
            className="glassmorphism rounded-lg p-6 text-center card-hover"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <div className="bg-[#1A1A1A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 neon-border-blue">
              <MessageSquare className="h-8 w-8 text-[#00E5FF]" />
            </div>
            <h3 className="text-xl font-rajdhani font-bold text-white mb-3">
              1. Entre no Discord
            </h3>
            <p className="text-gray-300 mb-4">
              Junte-se ao nosso servidor do Discord para ficar por dentro das atualizações e conhecer nossa comunidade.
            </p>
            <a 
              href={serverInfo?.discordUrl || "https://discord.gg/NZAAaAmQtC"} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cyberpunk-btn inline-flex items-center px-4 py-2 rounded-md bg-[#5865F2] hover:bg-[#5865F2]/80 text-white"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
              </svg>
              Discord
            </a>
          </motion.div>
          
          <motion.div 
            className="glassmorphism rounded-lg p-6 text-center card-hover"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-[#1A1A1A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 neon-border-pink">
              <Download className="h-8 w-8 text-[#FF0A54]" />
            </div>
            <h3 className="text-xl font-rajdhani font-bold text-white mb-3">
              2. Instale o FiveM
            </h3>
            <p className="text-gray-300 mb-4">
              Baixe e instale o cliente FiveM. É necessário ter o GTA V original na sua biblioteca de jogos.
            </p>
            <a 
              href="https://fivem.net/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cyberpunk-btn inline-flex items-center px-4 py-2 rounded-md bg-[#FF0A54] hover:bg-[#FF0A54]/80 text-white"
            >
              <Download className="h-5 w-5 mr-2" />
              Download FiveM
            </a>
          </motion.div>
          
          <motion.div 
            className="glassmorphism rounded-lg p-6 text-center card-hover"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-[#1A1A1A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 neon-border-blue">
              <PlusCircle className="h-8 w-8 text-[#00E5FF]" />
            </div>
            <h3 className="text-xl font-rajdhani font-bold text-white mb-3">
              3. Conecte-se ao Servidor
            </h3>
            <p className="text-gray-300 mb-4">
              Abra o FiveM e adicione nosso servidor aos favoritos ou conecte-se diretamente usando nosso código.
            </p>
            <div className="flex flex-col space-y-2">
              <div className="bg-[#121212] py-2 px-4 rounded-md font-mono text-white flex items-center justify-between">
                <span>{serverInfo?.connectionUrl || "cfx.re/join/85e4q3"}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopyClick}
                  className="text-[#00E5FF] hover:text-[#00E5FF]/80 hover:bg-[#00E5FF]/10"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              <a 
                href={`fivem://connect/${serverInfo?.connectionUrl || "cfx.re/join/85e4q3"}`} 
                className="cyberpunk-btn px-4 py-2 rounded-md bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black"
              >
                Conectar Direto
              </a>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="glassmorphism max-w-4xl mx-auto mt-12 p-6 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="mb-6 md:mb-0 md:mr-6 flex-shrink-0">
              <div className="bg-[#1A1A1A] w-16 h-16 rounded-full flex items-center justify-center neon-border-pink">
                <Gift className="h-8 w-8 text-[#FF0A54]" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-rajdhani font-bold text-white mb-2">
                Pacotes VIP Disponíveis
              </h3>
              <p className="text-gray-300 mb-4">
                Desbloqueie vantagens exclusivas no servidor com nossos pacotes VIP. 
                Veículos exclusivos, slots prioritários, benefícios em jogo e muito mais.
              </p>
              <a 
                href="https://tokyo-edge-roleplay-store.tebex.io/" 
                target="_blank"
                rel="noopener noreferrer"
                className="cyberpunk-btn inline-flex items-center px-4 py-2 rounded-md bg-[#FF0A54] hover:bg-[#FF0A54]/80 text-white"
              >
                Ver Pacotes VIP
                <ChevronRight className="h-5 w-5 ml-1" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default JoinSection;
