import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { compare, hash } from 'bcrypt';
import { config } from './config';
import { db } from './db';
import { User, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import MySQLStore from 'express-mysql-session';
import { pool } from './db';
import createMemoryStore from 'memorystore';

// Definição de tipos para a integração Discord
interface DiscordProfile {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
  guilds?: Array<{
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: number;
    features: string[];
  }>;
}

declare global {
  namespace Express {
    // Corrigi definição recursiva do tipo User
    interface User {
      id: number;
      username: string;
      password?: string | null;
      discordId?: string | null;
      discordUsername?: string | null;
      avatar?: string | null;
      role: string;
      permissions?: string[] | null;
      lastLogin?: Date | null;
      createdAt?: Date;
      updatedAt?: Date;
    }
  }
}

export function setupAuth(app: Express) {
  // Sempre usar MemoryStore para maior compatibilidade com Windows
  console.log("Usando MemoryStore para sessões - máxima compatibilidade com Windows");
  
  const MemoryStore = createMemoryStore(session);
  const sessionOptions: session.SessionOptions = {
    secret: config.auth.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000 // limpar sessões expiradas a cada 24h
    }),
    cookie: {
      secure: !config.server.isDev,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    }
  };

  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  // Serializar/Deserializar usuário
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      // Caso especial para o usuário admin
      if (id === 1) {
        const adminUser = {
          id: 1,
          username: 'thuglife',
          role: 'admin',
          permissions: ['admin'],
          lastLogin: new Date(),
          createdAt: new Date()
        };
        return done(null, adminUser);
      }
      
      try {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        done(null, user || undefined);
      } catch (dbError) {
        console.error("Erro ao buscar usuário na deserialização:", dbError);
        
        // Se for o ID 1 (admin) e o banco falhar, usar objeto hardcoded
        if (id === 1) {
          const adminUser = {
            id: 1,
            username: 'thuglife',
            role: 'admin',
            permissions: ['admin'],
            lastLogin: new Date(),
            createdAt: new Date()
          };
          return done(null, adminUser);
        }
        
        done(null, undefined);
      }
    } catch (error) {
      done(error, undefined);
    }
  });

  // Estratégia Discord - somente se as credenciais existirem
  if (config.auth.discord.clientId && config.auth.discord.clientSecret) {
    passport.use(
      new DiscordStrategy(
        {
          clientID: config.auth.discord.clientId,
          clientSecret: config.auth.discord.clientSecret,
          callbackURL: config.auth.discord.callbackUrl,
          scope: config.auth.discord.scopes,
        },
      async (accessToken, refreshToken, profile: DiscordProfile, done) => {
        try {
          // Procurar usuário pelo Discord ID
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.discordId, profile.id));

          if (existingUser) {
            // Atualizar informações do usuário
            await db
              .update(users)
              .set({
                discordUsername: profile.username,
                avatar: profile.avatar 
                  ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}` 
                  : null,
                lastLogin: new Date(),
              })
              .where(eq(users.id, existingUser.id));
              
            // Buscar o usuário atualizado
            const [updatedUser] = await db
              .select()
              .from(users)
              .where(eq(users.id, existingUser.id));

            return done(null, updatedUser);
          }

          // Criar novo usuário
          const result = await db
            .insert(users)
            .values({
              username: profile.username,
              discordId: profile.id,
              discordUsername: profile.username,
              avatar: profile.avatar 
                ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}` 
                : null,
              role: 'user',
              lastLogin: new Date(),
            });
          
          // Buscar o usuário recém-criado usando o ID retornado pelo MySQL
          const id = typeof result.insertId === 'bigint' ? Number(result.insertId) : Number(result.insertId);
          const [newUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, id));

          return done(null, newUser);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
  }

  // Estratégia Local
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Caso especial para credenciais thuglife/thuglife
        if (username === 'thuglife' && password === 'thuglife') {
          console.log('Login administrativo especial');
          const user = {
            id: 1,
            username: 'thuglife',
            role: 'admin',
            permissions: ['admin'],
            lastLogin: new Date(),
            createdAt: new Date()
          };
          return done(null, user);
        }
        
        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, username));

          if (!user || !user.password) {
            return done(null, false, { message: 'Usuário não encontrado ou senha incorreta' });
          }

          const isValid = await compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: 'Usuário não encontrado ou senha incorreta' });
          }

          // Atualizar último login
          await db
            .update(users)
            .set({ lastLogin: new Date() })
            .where(eq(users.id, user.id));

          return done(null, user);
        } catch (dbError) {
          console.error('Erro ao acessar banco de dados:', dbError);
          // Se falhar a verificação no banco, tentar usar variação in-memory
          if (username === 'thuglife' && password === 'thuglife') {
            console.log('Caindo no fallback administrativo após erro de DB');
            const user = {
              id: 1,
              username: 'thuglife',
              role: 'admin',
              permissions: ['admin'],
              lastLogin: new Date(),
              createdAt: new Date()
            };
            return done(null, user);
          }
          return done(null, false, { message: 'Erro de conexão com banco de dados' });
        }
      } catch (error) {
        return done(error as Error);
      }
    })
  );

  // Rotas de autenticação Discord - somente se as credenciais existirem
  if (config.auth.discord.clientId && config.auth.discord.clientSecret) {
    app.get('/api/auth/discord', passport.authenticate('discord'));
    
    app.get(
      '/api/auth/discord/callback',
      passport.authenticate('discord', {
        successRedirect: '/',
        failureRedirect: '/login?error=true',
      })
    );
  } else {
    // Se não tiver as credenciais, criar uma rota simulada para o Discord
    // para evitar o erro 404
    app.get('/api/auth/discord', (req, res) => {
      console.log("Tentativa de login com Discord, mas as credenciais não estão configuradas");
      res.redirect('/login?error=discord_not_configured');
    });
  }

  // Rotas de autenticação local
  app.post('/api/auth/login', (req, res, next) => {
    console.log("Tentativa de login:", req.body.username);
    
    // Caso especial: login administrativo direto
    if (req.body.username === 'thuglife' && req.body.password === 'thuglife') {
      console.log('Login administrativo direto aceito');
      const adminUser = {
        id: 1,
        username: 'thuglife',
        role: 'admin',
        permissions: ['admin'],
        lastLogin: new Date(),
        createdAt: new Date()
      };
      
      req.login(adminUser, (err) => {
        if (err) {
          console.error('Erro ao fazer login admin:', err);
          return res.status(500).json({ message: 'Erro ao fazer login' });
        }
        return res.json(adminUser);
      });
    } else {
      // Login normal via passport
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          console.error('Erro durante autenticação:', err);
          return next(err);
        }
        if (!user) {
          console.log('Login falhou:', info);
          return res.status(401).json({ message: info?.message || 'Usuário ou senha inválidos' });
        }
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json(user);
        });
      })(req, res, next);
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      // Verificar se o usuário já existe
      const { username, password } = req.body;
      
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

      if (existingUser) {
        return res.status(400).json({ message: 'Usuário já existe' });
      }

      // Hash da senha
      const hashedPassword = await hash(password, 10);

      // Criar novo usuário
      const result = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
          role: 'user',
          lastLogin: new Date(),
        });
      
      // Buscar o usuário recém-criado usando o ID retornado pelo MySQL
      const id = typeof result.insertId === 'bigint' ? Number(result.insertId) : Number(result.insertId);
      const [newUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));

      // Fazer login automático
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Erro ao fazer login' });
        }
        return res.json(newUser);
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao fazer logout' });
      }
      res.status(200).json({ message: 'Logout realizado com sucesso' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    res.json(req.user);
  });

  // Helper de autorização
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.isAdmin = () => req.isAuthenticated() && req.user?.role === 'admin';
    req.isStaff = () => req.isAuthenticated() && ['admin', 'moderator', 'support'].includes(req.user?.role || '');
    next();
  });
}

// Middleware para rotas protegidas
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Não autenticado' });
  }
  next();
}

// Middleware para rotas de administração
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  next();
}

// Middleware para rotas de staff
export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !['admin', 'moderator', 'support'].includes(req.user?.role || '')) {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  next();
}

// Extensão das interfaces
declare global {
  namespace Express {
    interface Request {
      isAdmin: () => boolean;
      isStaff: () => boolean;
    }
  }
}