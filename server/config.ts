// Configurações do servidor e aplicação

export const config = {
  server: {
    port: process.env.PORT || 5000,
    host: process.env.IP_ADDRESS || '0.0.0.0',
    isDev: process.env.NODE_ENV !== 'production',
    vps: {
      ip: '45.89.30.198',
      domain: process.env.DOMAIN || 'tokyoedgerp.com'
    }
  },
  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'tokyoedgerp-session-secret',
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      callbackUrl: process.env.DISCORD_CALLBACK_URL || (
        process.env.NODE_ENV === 'production'
          ? 'http://45.89.30.198/api/auth/discord/callback'
          : 'http://localhost:5000/api/auth/discord/callback'
      ),
      scopes: ['identify', 'email', 'guilds']
    }
  },
  fivem: {
    serverIp: '45.89.30.198',
    serverPort: '30120',
    maxPlayers: 128
  }
};