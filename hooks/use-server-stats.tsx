import { useState, useEffect, useRef } from 'react';

interface ServerStats {
  online: boolean;
  players: number;
  maxPlayers: number;
  lastRestart: string;
  ping: number;
}

export function useServerStats(): [ServerStats, boolean] {
  const [serverStats, setServerStats] = useState<ServerStats>({
    online: false,
    players: 0,
    maxPlayers: 0,
    lastRestart: '',
    ping: 0
  });
  
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    let socket: WebSocket;
    
    try {
      // Define o protocolo correto com base no protocolo atual da página
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      // Cria a conexão WebSocket
      console.log(`Tentando conectar WebSocket a: ${wsUrl}`);
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Manipulador de abertura de conexão
      socket.onopen = () => {
        console.log('Conexão WebSocket estabelecida');
        setConnected(true);
        
        // Solicita estatísticas iniciais
        socket.send(JSON.stringify({ type: 'get_server_stats' }));
      };
      
      // Manipulador de mensagens
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'server_stats') {
            setServerStats({
              online: data.online,
              players: data.players,
              maxPlayers: data.maxPlayers,
              lastRestart: data.lastRestart,
              ping: data.ping
            });
          }
        } catch (error) {
          console.error('Erro ao processar mensagem do servidor:', error);
        }
      };
      
      // Manipulador de erros
      socket.onerror = (error) => {
        console.error('Erro na conexão WebSocket:', error);
        setConnected(false);
      };
      
      // Manipulador de fechamento de conexão
      socket.onclose = () => {
        console.log('Conexão WebSocket fechada');
        setConnected(false);
      };
    } catch (error) {
      console.error('Erro ao inicializar WebSocket:', error);
      setConnected(false);
    }
    
    // Limpeza quando o componente for desmontado
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);
  
  return [serverStats, connected];
}