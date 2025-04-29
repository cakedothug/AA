export async function getDiscordLoginUrl(redirectTo?: string): Promise<string> {
  try {
    // Obter a URL de autenticação do Discord do servidor
    const response = await fetch(`/api/auth/discord/url${redirectTo ? `?redirect_to=${redirectTo}` : ''}`);
    const data = await response.json();
    
    // Retornar diretamente a URL para autenticação
    return data.url;
  } catch (error) {
    console.error("Erro ao obter URL de autenticação Discord:", error);
    return '#'; // Fallback em caso de erro
  }
}

export async function getServerStatus() {
  try {
    // Busca dados reais do servidor FiveM através da API
    const response = await fetch('/api/server/status');
    const data = await response.json();
    
    if (data.online) {
      return {
        online: true,
        players: `${data.players}/${data.maxPlayers}`,
        lastRestart: data.lastRestart,
        ping: data.ping
      };
    } else {
      return {
        online: false,
        players: '0/0',
        lastRestart: null,
        ping: null
      };
    }
  } catch (error) {
    console.error("Erro ao buscar status do servidor:", error);
    return {
      online: false,
      players: '0/0',
      lastRestart: null,
      ping: null
    };
  }
}

export async function fetchServerInfo() {
  try {
    const response = await fetch('/api/settings/public');
    const data = await response.json();
    
    const defaultServerInfo = {
      name: "Tokyo Edge Roleplay",
      description: "O servidor de GTA V mais imersivo com foco em roleplay brasileiro urbano",
      connectionUrl: "cfx.re/join/85e4q3",
      discordUrl: "https://discord.gg/NZAAaAmQtC"
    };
    
    // Find the values in the settings
    if (data.settings) {
      const findSetting = (key: string) => data.settings.find((s: any) => s.key === key)?.value;
      
      return {
        name: findSetting("server_name") || defaultServerInfo.name,
        description: findSetting("server_description") || defaultServerInfo.description,
        connectionUrl: findSetting("server_connection_url") || defaultServerInfo.connectionUrl,
        discordUrl: findSetting("discord_invite_url") || defaultServerInfo.discordUrl
      };
    }
    
    return defaultServerInfo;
  } catch (error) {
    console.error("Erro ao buscar informações do servidor:", error);
    return {
      name: "Tokyo Edge Roleplay",
      description: "O servidor de GTA V mais imersivo com foco em roleplay brasileiro urbano",
      connectionUrl: "cfx.re/join/85e4q3",
      discordUrl: "https://discord.gg/NZAAaAmQtC"
    };
  }
}

export async function login(username: string, password: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha na autenticação');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao fazer logout');
    }
    
    return true;
  } catch (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
}
