import React from 'react';
import { useServerStats } from "@/hooks/use-server-stats";
import { useQuery } from "@tanstack/react-query";
import { fetchServerInfo } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { 
  CircleUserRound, 
  Signal, 
  Clock, 
  UserCheck, 
  Users, 
  Cpu
} from "lucide-react";

const ServerStats: React.FC = () => {
  const [serverStats, connected] = useServerStats();
  
  const { data: serverInfo } = useQuery({
    queryKey: ["/api/settings/public"],
    queryFn: fetchServerInfo,
  });

  return (
    <section className="py-16 bg-gradient-to-b from-[#121212] to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-rajdhani font-bold text-white">
            Estatísticas do <span className="text-[#00E5FF]">Servidor</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Confira como está nosso servidor neste momento. Junte-se a outros jogadores e viva experiências únicas em nosso mundo cyberpunk.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="glassmorphism p-6 rounded-lg border border-[#2D2D2D] transform transition-all hover:scale-105">
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-full mr-4 ${serverStats.online ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <Signal className={`h-6 w-6 ${serverStats.online ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Status</h3>
                <p className={`text-sm ${serverStats.online ? 'text-green-500' : 'text-red-500'}`}>
                  {serverStats.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div className={`${serverStats.online ? 'bg-green-500' : 'bg-red-500'} h-2 rounded-full`} 
                  style={{ width: `${serverStats.online ? '100%' : '0%'}` }}></div>
              </div>
            </div>
          </div>
          
          {/* Players Card */}
          <div className="glassmorphism p-6 rounded-lg border border-[#2D2D2D] transform transition-all hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-blue-500/20 mr-4">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Jogadores</h3>
                <p className="text-sm text-blue-500">
                  {serverStats.players} / {serverStats.maxPlayers}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(serverStats.players / serverStats.maxPlayers) * 100}%` }}></div>
              </div>
            </div>
          </div>
          
          {/* Ping Card */}
          <div className="glassmorphism p-6 rounded-lg border border-[#2D2D2D] transform transition-all hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-purple-500/20 mr-4">
                <Cpu className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Ping</h3>
                <p className="text-sm text-purple-500">{serverStats.ping} ms</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((serverStats.ping / 150) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
          
          {/* Last restart */}
          <div className="glassmorphism p-6 rounded-lg border border-[#2D2D2D] transform transition-all hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-yellow-500/20 mr-4">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Último Restart</h3>
                <p className="text-sm text-yellow-500">
                  {serverStats.lastRestart 
                    ? new Date(serverStats.lastRestart).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Connection Card */}
          <div className="glassmorphism p-6 rounded-lg border border-[#2D2D2D] transform transition-all hover:scale-105 md:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-cyan-500/20 mr-4">
                <CircleUserRound className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Conecte-se Agora</h3>
                <p className="text-sm text-gray-400">
                  Entre no servidor e faça parte desta comunidade!
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <a 
                href={`${serverInfo?.connectionUrl || 'cfx.re/join/85e4q3'}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="cyberpunk-btn flex-1 block text-center bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black rounded-md py-3 px-6 font-medium"
              >
                Conectar ao Servidor
              </a>
              <a 
                href={serverInfo?.discordUrl || "https://discord.gg/NZAAaAmQtC"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="cyberpunk-btn flex-1 block text-center bg-[#5865F2] hover:bg-[#5865F2]/80 text-white rounded-md py-3 px-6 font-medium"
              >
                Entrar no Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServerStats;