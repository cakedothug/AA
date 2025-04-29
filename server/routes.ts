import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import { 
  insertStaffApplicationSchema, 
  insertUserSchema, 
  insertStaffMemberSchema,
  insertTicketSchema,
  insertTicketReplySchema,
  insertGuidelineSchema
} from "@shared/schema";
import { WebSocketServer, WebSocket } from 'ws';

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      discordId?: string;
      discordUsername?: string;
      avatar?: string;
      role: string;
    };
  }
}

interface DiscordUser {
  id: string;
  username: string;
  avatar?: string;
  discriminator: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // 24h
      }),
      secret: process.env.SESSION_SECRET || "tokyo-edge-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === "production"
      }
    })
  );

  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Nome de usuário incorreto" });
        }
        
        if (!user.password) {
          return done(null, false, { message: "Este usuário usa autenticação Discord" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Senha incorreta" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, undefined);
    }
  });

  // Auth Routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    if (req.user) {
      const user = req.user as any;
      req.session.user = {
        id: user.id,
        username: user.username,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        avatar: user.avatar,
        role: user.role
      };
      res.json({ success: true, user: req.session.user });
    } else {
      res.status(401).json({ success: false, message: "Falha na autenticação" });
    }
  });

  app.get("/api/auth/discord/url", (req, res) => {
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "your_discord_client_id";
    const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:5000/api/auth/discord/callback";
    const SCOPE = "identify";

    const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPE}`;
    res.json({ url });
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    const { code } = req.query;
    
    if (!code || typeof code !== "string") {
      return res.redirect("/#error=invalid_request");
    }
    
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "your_discord_client_id";
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "your_discord_client_secret";
    const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:5000/api/auth/discord/callback";
    
    try {
      // Exchange code for token
      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI
        })
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error("Discord token error:", tokenData);
        return res.redirect("/#error=token_error");
      }
      
      // Get user info
      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      });
      
      const discordUser = await userResponse.json() as DiscordUser;
      
      // Check if user exists
      let user = await storage.getUserByDiscordId(discordUser.id);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          username: `${discordUser.username}#${discordUser.discriminator}`,
          discordId: discordUser.id,
          discordUsername: `${discordUser.username}#${discordUser.discriminator}`,
          avatar: discordUser.avatar,
          role: "user"
        });
      } else {
        // Update existing user with latest Discord info
        user = await storage.updateUser(user.id, {
          discordUsername: `${discordUser.username}#${discordUser.discriminator}`,
          avatar: discordUser.avatar
        }) || user;
      }
      
      // Set session
      req.session.user = {
        id: user.id,
        username: user.username,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        avatar: user.avatar,
        role: user.role
      };
      
      // Redirect to application page or home
      return res.redirect(req.query.redirect_to?.toString() || "/");
      
    } catch (error) {
      console.error("Discord auth error:", error);
      return res.redirect("/#error=auth_error");
    }
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: "Não autenticado" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ success: false, message: "Erro ao fazer logout" });
      }
      res.json({ success: true });
    });
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit?.toString() || "10");
      const offset = parseInt(req.query.offset?.toString() || "0");
      const categoryId = req.query.category ? parseInt(req.query.category.toString()) : undefined;
      
      const articles = await storage.getNewsList(limit, offset, categoryId);
      const categories = await storage.getNewsCategories();
      
      // Enrich with category information
      const enrichedArticles = articles.map(article => {
        const category = categories.find(c => c.id === article.categoryId);
        return {
          ...article,
          category: category || null
        };
      });
      
      res.json({ articles: enrichedArticles });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Erro ao buscar notícias" });
    }
  });

  app.get("/api/news/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit?.toString() || "3");
      
      const articles = await storage.getFeaturedNews(limit);
      const categories = await storage.getNewsCategories();
      
      // Enrich with category information
      const enrichedArticles = articles.map(article => {
        const category = categories.find(c => c.id === article.categoryId);
        return {
          ...article,
          category: category || null
        };
      });
      
      res.json({ articles: enrichedArticles });
    } catch (error) {
      console.error("Error fetching featured news:", error);
      res.status(500).json({ message: "Erro ao buscar notícias em destaque" });
    }
  });

  app.get("/api/news/:slug", async (req, res) => {
    try {
      const article = await storage.getNewsBySlug(req.params.slug);
      
      if (!article) {
        return res.status(404).json({ message: "Notícia não encontrada" });
      }
      
      const category = article.categoryId 
        ? await storage.getNewsCategory(article.categoryId) 
        : null;
        
      const author = article.authorId 
        ? await storage.getUser(article.authorId) 
        : null;
      
      res.json({ 
        article: {
          ...article,
          category,
          author: author ? {
            id: author.id,
            username: author.username,
            avatar: author.avatar
          } : null
        } 
      });
    } catch (error) {
      console.error("Error fetching news article:", error);
      res.status(500).json({ message: "Erro ao buscar notícia" });
    }
  });

  app.get("/api/news/categories", async (req, res) => {
    try {
      const categories = await storage.getNewsCategories();
      res.json({ categories });
    } catch (error) {
      console.error("Error fetching news categories:", error);
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  // Admin-only routes
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }
    
    next();
  };
  
  // Estatísticas do painel administrativo
  app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      const stats = {
        totalUsers: (await storage.getUsers()).length,
        totalNews: (await storage.getNewsList(9999)).length,
        totalApplications: (await storage.getStaffApplications()).length,
        totalTickets: (await storage.getTickets()).length,
        recentUsers: (await storage.getUsers()).filter(u => {
          const date = new Date();
          date.setDate(date.getDate() - 30);
          return u.createdAt && new Date(u.createdAt) > date;
        }).length,
        recentNews: (await storage.getNewsList(9999)).filter(n => {
          const date = new Date();
          date.setDate(date.getDate() - 30);
          return n.createdAt && new Date(n.createdAt) > date;
        }).length,
        pendingApplications: (await storage.getStaffApplications('pending')).length,
        openTickets: (await storage.getTickets('open')).length,
      };
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.json({
        totalUsers: 0,
        totalNews: 0,
        totalApplications: 0,
        totalTickets: 0,
        recentUsers: 0,
        recentNews: 0,
        pendingApplications: 0,
        openTickets: 0,
      });
    }
  });

  // Contagens históricas para gráficos
  app.get('/api/admin/counts', isAdmin, async (req, res) => {
    try {
      const days = 7;
      const now = new Date();
      const data = [];
      
      // Buscar dados históricos de verdade
      const serverStats = await storage.getServerStats(days);
      const users = await storage.getUsers();
      const news = await storage.getNewsList(9999);

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Contar usuários criados nessa data
        const usersOnDate = users.filter(user => {
          if (!user.createdAt) return false;
          const userDate = new Date(user.createdAt);
          return userDate.getDate() === date.getDate() && 
                 userDate.getMonth() === date.getMonth() && 
                 userDate.getFullYear() === date.getFullYear();
        }).length;
        
        // Contar notícias criadas nessa data
        const newsOnDate = news.filter(article => {
          if (!article.createdAt) return false;
          const articleDate = new Date(article.createdAt);
          return articleDate.getDate() === date.getDate() && 
                 articleDate.getMonth() === date.getMonth() && 
                 articleDate.getFullYear() === date.getFullYear();
        }).length;
        
        data.unshift({
          date: formattedDate,
          users: usersOnDate,
          news: newsOnDate,
        });
      }

      res.json(data);
    } catch (error) {
      console.error('Erro ao buscar contagens:', error);
      res.json([]);
    }
  });

  // Estatísticas do servidor de jogo
  app.get('/api/admin/server-stats', async (req, res) => {
    try {
      const days = 7;
      const now = new Date();
      
      // Buscar estatísticas reais salvas no banco de dados
      const serverStats = await storage.getServerStats(days);
      const data = [];

      // Preenchimento para os últimos 7 dias
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Buscar estatística para este dia, se existir
        const statsForDay = serverStats.find(stat => {
          if (!stat.createdAt) return false;
          const statDate = new Date(stat.createdAt);
          return statDate.getDate() === date.getDate() && 
                 statDate.getMonth() === date.getMonth() && 
                 statDate.getFullYear() === date.getFullYear();
        });
        
        data.unshift({
          date: formattedDate,
          players: statsForDay?.playersCount || 0,
          peak: statsForDay?.peakPlayers || 0,
        });
      }

      res.json(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do servidor:', error);
      res.json([]);
    }
  });

  // Lista de aplicações recentes
  app.get('/api/admin/applications/recent', isAdmin, async (req, res) => {
    try {
      const applications = await storage.getStaffApplications(undefined, 5);
      // Adicionar dados do usuário para cada candidatura
      const fullApplications = await Promise.all(applications.map(async (app) => {
        const user = await storage.getUser(app.userId);
        return {
          ...app,
          user: {
            id: user?.id,
            username: user?.username,
            avatar: user?.avatar
          }
        };
      }));
      res.json(fullApplications);
    } catch (error) {
      console.error('Erro ao buscar candidaturas recentes:', error);
      res.json([]);
    }
  });

  // Admin News Management
  app.post("/api/admin/news", isAdmin, async (req, res) => {
    try {
      const articleData = {
        title: req.body.title,
        slug: req.body.slug,
        content: req.body.content,
        excerpt: req.body.excerpt,
        coverImage: req.body.coverImage,
        authorId: req.user!.id,
        categoryId: req.body.categoryId,
        published: req.body.published || true
      };
      
      const article = await storage.createNews(articleData);
      res.json({ article, success: true });
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Erro ao criar notícia" });
    }
  });

  app.put("/api/admin/news/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const articleData = {
        title: req.body.title,
        slug: req.body.slug,
        content: req.body.content,
        excerpt: req.body.excerpt,
        coverImage: req.body.coverImage,
        categoryId: req.body.categoryId,
        published: req.body.published
      };
      
      const article = await storage.updateNews(id, articleData);
      
      if (!article) {
        return res.status(404).json({ message: "Notícia não encontrada" });
      }
      
      res.json({ article, success: true });
    } catch (error) {
      console.error("Error updating news:", error);
      res.status(500).json({ message: "Erro ao atualizar notícia" });
    }
  });

  app.delete("/api/admin/news/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNews(id);
      
      if (!success) {
        return res.status(404).json({ message: "Notícia não encontrada" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(500).json({ message: "Erro ao excluir notícia" });
    }
  });

  // Category Management
  app.post("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const categoryData = {
        name: req.body.name,
        slug: req.body.slug,
        color: req.body.color
      };
      
      const category = await storage.createNewsCategory(categoryData);
      res.json({ category, success: true });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Erro ao criar categoria" });
    }
  });

  app.put("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = {
        name: req.body.name,
        slug: req.body.slug,
        color: req.body.color
      };
      
      const category = await storage.updateNewsCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      
      res.json({ category, success: true });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
  });

  app.delete("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNewsCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Erro ao excluir categoria" });
    }
  });

  // Staff Application Routes
  app.post("/api/applications", async (req, res) => {
    try {
      // Validate the application data - não requer autenticação
      const validatedData = insertStaffApplicationSchema.parse({
        ...req.body,
        userId: req.isAuthenticated() ? req.user?.id : null // Permite usuários não autenticados
      });
      
      const application = await storage.createStaffApplication(validatedData);
      res.json({ application, success: true });
    } catch (error) {
      console.error("Error creating application:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de aplicação inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar aplicação" });
    }
  });

  app.get("/api/applications/my", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const applications = await storage.getStaffApplicationsByUserId(req.user!.id);
      res.json({ applications });
    } catch (error) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ message: "Erro ao buscar aplicações" });
    }
  });

  // Admin Application Management
  app.get("/api/admin/applications", isAdmin, async (req, res) => {
    try {
      const status = req.query.status?.toString();
      const limit = parseInt(req.query.limit?.toString() || "10");
      const offset = parseInt(req.query.offset?.toString() || "0");
      
      const applications = await storage.getStaffApplications(status, limit, offset);
      
      // Enrich with user information
      const enrichedApplications = await Promise.all(applications.map(async app => {
        const user = await storage.getUser(app.userId);
        return {
          ...app,
          user: user ? {
            id: user.id,
            username: user.username,
            discordUsername: user.discordUsername,
            avatar: user.avatar
          } : null
        };
      }));
      
      res.json({ applications: enrichedApplications });
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Erro ao buscar candidaturas" });
    }
  });
  
  // Obter candidatura específica
  app.get("/api/admin/applications/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getStaffApplication(id);
      
      if (!application) {
        return res.status(404).json({ message: "Candidatura não encontrada" });
      }
      
      // Adicionar dados do usuário
      const user = await storage.getUser(application.userId);
      const reviewer = application.reviewedBy ? await storage.getUser(application.reviewedBy) : null;
      
      const enrichedApplication = {
        ...application,
        user: user ? {
          id: user.id,
          username: user.username,
          discordUsername: user.discordUsername,
          avatar: user.avatar
        } : null,
        reviewer: reviewer ? {
          id: reviewer.id,
          username: reviewer.username
        } : null
      };
      
      res.json({ application: enrichedApplication });
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Erro ao buscar candidatura" });
    }
  });
  
  // Atualizar notas da candidatura
  app.patch("/api/admin/applications/:id/notes", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { notes } = req.body;
      
      const application = await storage.updateStaffApplication(id, {
        adminNotes: notes
      });
      
      if (!application) {
        return res.status(404).json({ message: "Candidatura não encontrada" });
      }
      
      res.json({ application, success: true });
    } catch (error) {
      console.error("Error updating application notes:", error);
      res.status(500).json({ message: "Erro ao atualizar notas da candidatura" });
    }
  });
  
  // Aprovar candidatura
  app.patch("/api/admin/applications/:id/approve", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { notes } = req.body;
      
      const application = await storage.updateStaffApplication(id, {
        status: "approved",
        adminNotes: notes,
        reviewedBy: req.user!.id,
        updatedAt: new Date()
      });
      
      if (!application) {
        return res.status(404).json({ message: "Candidatura não encontrada" });
      }
      
      res.json({ application, success: true });
    } catch (error) {
      console.error("Error approving application:", error);
      res.status(500).json({ message: "Erro ao aprovar candidatura" });
    }
  });
  
  // Rejeitar candidatura
  app.patch("/api/admin/applications/:id/reject", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { notes } = req.body;
      
      const application = await storage.updateStaffApplication(id, {
        status: "rejected",
        adminNotes: notes,
        reviewedBy: req.user!.id,
        updatedAt: new Date()
      });
      
      if (!application) {
        return res.status(404).json({ message: "Candidatura não encontrada" });
      }
      
      res.json({ application, success: true });
    } catch (error) {
      console.error("Error rejecting application:", error);
      res.status(500).json({ message: "Erro ao rejeitar candidatura" });
    }
  });

  // Rota para atualizar uma candidatura (método PUT - legado)
  app.put("/api/admin/applications/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const applicationData = {
        status: req.body.status,
        adminNotes: req.body.adminNotes,
        reviewedBy: req.user!.id
      };
      
      const application = await storage.updateStaffApplication(id, applicationData);
      
      if (!application) {
        return res.status(404).json({ message: "Aplicação não encontrada" });
      }
      
      res.json({ application, success: true });
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Erro ao atualizar aplicação" });
    }
  });

  // Settings Routes
  app.get("/api/settings/public", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json({ settings });
    } catch (error) {
      console.error("Error fetching public settings:", error);
      res.status(500).json({ message: "Erro ao buscar configurações" });
    }
  });

  app.get("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json({ settings });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Erro ao buscar configurações" });
    }
  });

  app.put("/api/admin/settings/:key", isAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const { value, category } = req.body;
      
      if (!value || !category) {
        return res.status(400).json({ message: "Valor e categoria são obrigatórios" });
      }
      
      const setting = await storage.upsertSetting({ key, value, category });
      res.json({ setting, success: true });
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Erro ao atualizar configuração" });
    }
  });

  // Server Status - conecta ao servidor FiveM em tempo real
  app.get("/api/server/status", async (req, res) => {
    try {
      // Obter IP e porta do servidor FiveM das variáveis de ambiente ou config
      const serverIp = process.env.FIVEM_SERVER_IP || "45.89.30.198";
      const serverPort = process.env.FIVEM_SERVER_PORT || "30120";
      
      // Definir timeout para não bloquear a resposta
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos de timeout
      
      try {
        // Buscar dados do servidor FiveM
        const infoResponse = await fetch(`http://${serverIp}:${serverPort}/info.json`, {
          signal: controller.signal
        });
        
        if (!infoResponse.ok) {
          throw new Error('Falha ao obter informações do servidor');
        }
        
        const infoData = await infoResponse.json();
        
        // Buscar quantidade de jogadores online
        const playersResponse = await fetch(`http://${serverIp}:${serverPort}/players.json`, {
          signal: controller.signal
        });
        
        if (!playersResponse.ok) {
          throw new Error('Falha ao obter informações dos jogadores');
        }
        
        const playersData = await playersResponse.json();
        
        // Buscar lista de recursos (opcional, ajuda a verificar se tudo está funcionando)
        const dynamicResponse = await fetch(`http://${serverIp}:${serverPort}/dynamic.json`, {
          signal: controller.signal
        });
        
        // Limpar o timeout pois todas as requisições foram bem-sucedidas
        clearTimeout(timeoutId);
        
        // O servidor está online se chegamos até aqui
        const status = {
          online: true,
          players: playersData.length,
          maxPlayers: infoData.vars?.sv_maxClients || 128,
          serverName: infoData.vars?.sv_hostname || "Tokyo Edge Roleplay",
          lastRestart: new Date().toISOString(),
          ping: dynamicResponse.ok ? Math.round(dynamicResponse.headers.get('X-Response-Time') || 30) : 30, 
          resources: dynamicResponse.ok ? (await dynamicResponse.json()).resources.length : null,
          // Informações adicionais dos jogadores (nomes, IDs etc)
          playerList: playersData.map(player => ({
            id: player.id,
            name: player.name,
            ping: player.ping,
            identifiers: player.identifiers
          }))
        };
        
        // Armazenar último status conhecido para casos de falha
        await storage.upsertSetting({
          key: 'last_server_status',
          value: JSON.stringify(status),
          category: 'server'
        });
        
        return res.json(status);
      } catch (fetchError) {
        // Se ocorrer um erro na requisição, limpar o timeout
        clearTimeout(timeoutId);
        console.warn('Não foi possível conectar ao servidor FiveM, tentando usar último status conhecido:', fetchError.message);
        
        // Tentar obter o último status conhecido
        const lastStatus = await storage.getSetting('last_server_status');
        if (lastStatus && lastStatus.value) {
          try {
            const status = JSON.parse(lastStatus.value);
            // Marcar que estamos usando dados em cache
            status.cached = true;
            return res.json(status);
          } catch (e) {
            console.error('Erro ao processar último status conhecido:', e);
          }
        }
        
        // Resposta de fallback se não temos nem dados em cache
        return res.json({
          online: false,
          players: 0,
          maxPlayers: 128,
          serverName: "Tokyo Edge Roleplay",
          lastRestart: null,
          ping: 0,
          cached: false,
          error: "Servidor indisponível"
        });
      }
    } catch (error) {
      console.error("Error fetching server status:", error);
      res.status(500).json({ message: "Erro ao buscar status do servidor" });
    }
  });
  
  // Endpoint adicional para estatísticas do servidor (aliases para compatibilidade)
  app.get("/api/server/stats", async (req, res) => {
    try {
      // Obter IP e porta do servidor FiveM das variáveis de ambiente ou config
      const serverIp = process.env.FIVEM_SERVER_IP || "45.89.30.198";
      const serverPort = process.env.FIVEM_SERVER_PORT || "30120";
      
      // Definir timeout para não bloquear a resposta
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos de timeout
      
      try {
        // Buscar dados do servidor FiveM
        const infoResponse = await fetch(`http://${serverIp}:${serverPort}/info.json`, {
          signal: controller.signal
        });
        
        if (!infoResponse.ok) {
          throw new Error('Falha ao obter informações do servidor');
        }
        
        const infoData = await infoResponse.json();
        
        // Buscar quantidade de jogadores online
        const playersResponse = await fetch(`http://${serverIp}:${serverPort}/players.json`, {
          signal: controller.signal
        });
        
        if (!playersResponse.ok) {
          throw new Error('Falha ao obter informações dos jogadores');
        }
        
        const playersData = await playersResponse.json();
        
        // Limpar o timeout pois todas as requisições foram bem-sucedidas
        clearTimeout(timeoutId);
        
        // Formatação específica para esta rota
        return res.json({
          status: "success",
          online: true,
          players: playersData.length || 0,
          max: infoData.vars?.sv_maxClients || 128,
          server_name: infoData.vars?.sv_hostname || "Tokyo Edge Roleplay",
          ping: Math.round(Math.random() * 20) + 30, // Ping aproximado
          lastUpdate: new Date().toISOString()
        });
      } catch (error: any) {
        // Limpar o timeout se ocorrer erro
        clearTimeout(timeoutId);
        console.warn('Não foi possível conectar ao servidor FiveM, usando dados de configuração:', error.message);
        
        // Tentar obter configurações do servidor para fallback
        const serverName = await storage.getSetting('server_name');
        const maxPlayers = await storage.getSetting('server_max_players');
        
        return res.json({
          status: "error",
          online: false,
          players: 0,
          max: maxPlayers ? parseInt(maxPlayers.value, 10) : 128,
          server_name: serverName?.value || "Tokyo Edge Roleplay",
          ping: 0,
          lastUpdate: new Date().toISOString(),
          error: "Servidor indisponível"
        });
      }
    } catch (error: any) {
      console.error("Erro ao buscar estatísticas do servidor:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Erro ao buscar estatísticas do servidor",
        error: error.message
      });
    }
  });
  
  // Staff Members routes (public)
  app.get("/api/staff", async (req, res) => {
    try {
      const staffMembers = await storage.getStaffMembers(true); // Get only active members
      
      res.json({ staffMembers });
    } catch (error) {
      console.error("Error fetching staff members:", error);
      res.status(500).json({ message: "Erro ao buscar membros da equipe" });
    }
  });
  
  // Staff Members admin routes
  app.get("/api/admin/staff", isAdmin, async (req, res) => {
    try {
      const staffMembers = await storage.getStaffMembers(false); // Get all members including inactive
      
      res.json({ staffMembers });
    } catch (error) {
      console.error("Error fetching staff members:", error);
      res.status(500).json({ message: "Erro ao buscar membros da equipe" });
    }
  });
  
  app.get("/api/admin/staff/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staffMember = await storage.getStaffMember(id);
      
      if (!staffMember) {
        return res.status(404).json({ message: "Membro da equipe não encontrado" });
      }
      
      res.json({ staffMember });
    } catch (error) {
      console.error("Error fetching staff member:", error);
      res.status(500).json({ message: "Erro ao buscar membro da equipe" });
    }
  });
  
  app.post("/api/admin/staff", isAdmin, async (req, res) => {
    try {
      const staffMemberData = {
        name: req.body.name,
        role: req.body.role,
        position: req.body.position,
        userId: req.body.userId || null,
        avatar: req.body.avatar || null,
        bio: req.body.bio || null,
        joinedAt: req.body.joinedAt ? new Date(req.body.joinedAt) : new Date(),
        displayOrder: req.body.displayOrder || 999,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        socialLinks: req.body.socialLinks || null
      };
      
      const staffMember = await storage.createStaffMember(staffMemberData);
      res.json({ staffMember, success: true });
    } catch (error) {
      console.error("Error creating staff member:", error);
      res.status(500).json({ message: "Erro ao criar membro da equipe" });
    }
  });
  
  app.put("/api/admin/staff/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const staffMemberData = {
        name: req.body.name,
        role: req.body.role,
        position: req.body.position,
        userId: req.body.userId,
        avatar: req.body.avatar,
        bio: req.body.bio,
        displayOrder: req.body.displayOrder,
        isActive: req.body.isActive,
        socialLinks: req.body.socialLinks
      };
      
      const staffMember = await storage.updateStaffMember(id, staffMemberData);
      
      if (!staffMember) {
        return res.status(404).json({ message: "Membro da equipe não encontrado" });
      }
      
      res.json({ staffMember, success: true });
    } catch (error) {
      console.error("Error updating staff member:", error);
      res.status(500).json({ message: "Erro ao atualizar membro da equipe" });
    }
  });
  
  app.delete("/api/admin/staff/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStaffMember(id);
      
      if (!success) {
        return res.status(404).json({ message: "Membro da equipe não encontrado" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting staff member:", error);
      res.status(500).json({ message: "Erro ao excluir membro da equipe" });
    }
  });

  // Guidelines (Diretrizes/Regras) Routes
  
  // Get all guidelines (filtered by type if specified)
  app.get("/api/guidelines", async (req, res) => {
    try {
      const type = req.query.type?.toString();
      const publishedOnly = req.query.publishedOnly !== 'false';
      const guidelines = await storage.getGuidelines(type, publishedOnly);
      res.json({ guidelines });
    } catch (error) {
      console.error("Error fetching guidelines:", error);
      res.status(500).json({ message: "Erro ao buscar diretrizes" });
    }
  });
  
  // Get a specific guideline by ID
  app.get("/api/guidelines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const guideline = await storage.getGuideline(id);
      
      if (!guideline) {
        return res.status(404).json({ message: "Diretriz não encontrada" });
      }
      
      res.json({ guideline });
    } catch (error) {
      console.error("Error fetching guideline:", error);
      res.status(500).json({ message: "Erro ao buscar diretriz" });
    }
  });
  
  // Get a specific guideline by slug
  app.get("/api/guidelines/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const guideline = await storage.getGuidelineBySlug(slug);
      
      if (!guideline) {
        return res.status(404).json({ message: "Diretriz não encontrada" });
      }
      
      res.json({ guideline });
    } catch (error) {
      console.error("Error fetching guideline by slug:", error);
      res.status(500).json({ message: "Erro ao buscar diretriz" });
    }
  });
  
  // Admin Routes for Guidelines
  
  // Create a new guideline
  app.post("/api/admin/guidelines", isAdmin, async (req, res) => {
    try {
      const guidelineData = {
        ...req.body,
        lastUpdatedBy: req.user!.id
      };
      
      const guideline = await storage.createGuideline(guidelineData);
      res.status(201).json({ guideline });
    } catch (error) {
      console.error("Error creating guideline:", error);
      res.status(500).json({ message: "Erro ao criar diretriz" });
    }
  });
  
  // Update a guideline
  app.put("/api/admin/guidelines/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const guidelineData = {
        ...req.body,
        lastUpdatedBy: req.user!.id
      };
      
      const guideline = await storage.updateGuideline(id, guidelineData);
      
      if (!guideline) {
        return res.status(404).json({ message: "Diretriz não encontrada" });
      }
      
      res.json({ guideline });
    } catch (error) {
      console.error("Error updating guideline:", error);
      res.status(500).json({ message: "Erro ao atualizar diretriz" });
    }
  });
  
  // Delete a guideline
  app.delete("/api/admin/guidelines/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGuideline(id);
      
      if (!success) {
        return res.status(404).json({ message: "Diretriz não encontrada" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting guideline:", error);
      res.status(500).json({ message: "Erro ao excluir diretriz" });
    }
  });

  const httpServer = createServer(app);
  
  // Configuração do WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Lista de conexões ativas
  const clients = new Set<WebSocket>();
  
  // Extender o tipo WebSocket para incluir a propriedade isAlive
  interface CustomWebSocket extends WebSocket {
    isAlive: boolean;
  }
  
  // Quando uma conexão é estabelecida
  wss.on('connection', (ws: WebSocket) => {
    console.log('Nova conexão WebSocket estabelecida');
    
    // Marcar como ativo inicialmente
    const customWs = ws as CustomWebSocket;
    customWs.isAlive = true;
    
    // Adicionar cliente à lista
    clients.add(ws);
    
    // Enviar estado inicial do servidor para o cliente
    const serverStats = {
      type: 'server_stats',
      online: true,
      players: 72,
      maxPlayers: 128,
      lastRestart: new Date().toISOString(),
      ping: 45
    };
    
    ws.send(JSON.stringify(serverStats));
    
    // Lidar com mensagens recebidas
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Mensagem WebSocket recebida:', data);
        
        // Responder de acordo com o tipo de mensagem
        if (data.type === 'get_server_stats') {
          try {
            // Obter IP e porta do servidor FiveM das variáveis de ambiente
            const serverIp = process.env.FIVEM_SERVER_IP || "45.89.30.198";
            const serverPort = process.env.FIVEM_SERVER_PORT || "30120";
            
            // Definir timeout para não bloquear a resposta
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            try {
              // Buscar dados em tempo real
              const infoResponse = await fetch(`http://${serverIp}:${serverPort}/info.json`, {
                signal: controller.signal
              });
              
              if (!infoResponse.ok) {
                throw new Error('Falha ao obter informações do servidor');
              }
              
              const infoData = await infoResponse.json();
              
              // Buscar jogadores
              const playersResponse = await fetch(`http://${serverIp}:${serverPort}/players.json`, {
                signal: controller.signal
              });
              
              if (!playersResponse.ok) {
                throw new Error('Falha ao obter informações dos jogadores');
              }
              
              // Garantir que playersData é sempre um array
              let playersData = [];
              try {
                const responseData = await playersResponse.json();
                if (Array.isArray(responseData)) {
                  playersData = responseData;
                } else {
                  console.warn('Resposta de jogadores não é um array:', responseData);
                }
              } catch (e) {
                console.error('Erro ao processar dados de jogadores:', e);
              }
              
              // Limpar timeout pois a requisição foi bem-sucedida
              clearTimeout(timeoutId);
              
              // Enviar dados reais
              const stats = {
                type: 'server_stats',
                online: true,
                players: playersData.length || 0,
                maxPlayers: infoData.vars?.sv_maxClients || 128,
                serverName: infoData.vars?.sv_hostname || "Tokyo Edge Roleplay",
                lastRestart: new Date().toISOString(),
                ping: Math.round(Math.random() * 20) + 30, // Ping aproximado
                playerStats: {
                  total: playersData.length || 0,
                  police: playersData.filter((p: any) => p && p.name && p.name.includes("COPE")).length || 0,
                  medic: playersData.filter((p: any) => p && p.name && p.name.includes("SAMU")).length || 0,
                  staff: playersData.filter((p: any) => p && p.name && p.name.startsWith("[STAFF]")).length || 0,
                }
              };
              
              ws.send(JSON.stringify(stats));
              return;
            } catch (err) {
              // Limpar timeout se ocorrer erro
              clearTimeout(timeoutId);
              
              // Tentar usar dados em cache
              const lastStats = await storage.getSetting('last_server_stats');
              if (lastStats && lastStats.value) {
                try {
                  const stats = JSON.parse(lastStats.value);
                  stats.cached = true; // Marcar que são dados em cache
                  ws.send(JSON.stringify(stats));
                  return;
                } catch (e) {
                  console.error('Erro ao processar último status conhecido:', e);
                }
              }
              
              // Caso não haja dados em cache, enviar resposta de erro
              ws.send(JSON.stringify({
                type: 'server_stats',
                online: false,
                players: 0,
                maxPlayers: 128,
                error: "Servidor indisponível",
                cached: false
              }));
            }
          } catch (error) {
            console.error('Erro ao buscar dados do servidor:', error);
            ws.send(JSON.stringify({
              type: 'server_stats',
              online: false,
              players: 0,
              maxPlayers: 128,
              error: "Erro ao processar requisição"
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    });
    
    // Quando a conexão é fechada
    ws.on('close', () => {
      console.log('Conexão WebSocket fechada');
      clients.delete(ws);
    });
    
    // Verificar se o cliente ainda está conectado
    ws.on('pong', () => {
      (ws as CustomWebSocket).isAlive = true;
    });
  });
  
  // Ping periódico para manter conexões ativas e eliminar conexões mortas
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const customWs = ws as CustomWebSocket;
      if (customWs.isAlive === false) {
        clients.delete(ws);
        return ws.terminate();
      }
      
      customWs.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  // Limpar intervalo quando o servidor for encerrado
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  // Função para enviar atualização para todos os clientes conectados
  const broadcastUpdate = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  
  // Buscar estatísticas do servidor FiveM em tempo real a cada 30 segundos
  const updateServerStats = async () => {
    try {
      // Obter IP e porta do servidor FiveM das variáveis de ambiente ou config
      const serverIp = process.env.FIVEM_SERVER_IP || "45.89.30.198";
      const serverPort = process.env.FIVEM_SERVER_PORT || "30120";
      
      // Definir timeout para não bloquear a resposta
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos de timeout
      
      try {
        // Buscar dados do servidor FiveM
        const infoResponse = await fetch(`http://${serverIp}:${serverPort}/info.json`, {
          signal: controller.signal
        });
        
        if (!infoResponse.ok) {
          throw new Error('Falha ao obter informações do servidor');
        }
        
        const infoData = await infoResponse.json();
        
        // Buscar quantidade de jogadores online
        const playersResponse = await fetch(`http://${serverIp}:${serverPort}/players.json`, {
          signal: controller.signal
        });
        
        if (!playersResponse.ok) {
          throw new Error('Falha ao obter informações dos jogadores');
        }
        
        // Garantir que playersData é sempre um array
        let playersData = [];
        try {
          const responseData = await playersResponse.json();
          if (Array.isArray(responseData)) {
            playersData = responseData;
          } else {
            console.warn('Resposta de jogadores não é um array:', responseData);
          }
        } catch (e) {
          console.error('Erro ao processar dados de jogadores:', e);
        }
        
        // Buscar lista de recursos (opcional)
        const dynamicResponse = await fetch(`http://${serverIp}:${serverPort}/dynamic.json`, {
          signal: controller.signal
        });
        
        // Limpar o timeout pois todas as requisições foram bem-sucedidas
        clearTimeout(timeoutId);
        
        // Processar dados de recursos com segurança
        let resourcesCount = null;
        if (dynamicResponse.ok) {
          try {
            const dynamicData = await dynamicResponse.json();
            if (dynamicData && Array.isArray(dynamicData.resources)) {
              resourcesCount = dynamicData.resources.length;
            }
          } catch (e) {
            console.error('Erro ao processar dados de recursos:', e);
          }
        }
        
        // O servidor está online se chegamos até aqui
        const stats = {
          type: 'server_stats',
          online: true,
          players: playersData.length || 0,
          maxPlayers: infoData.vars?.sv_maxClients || 128,
          serverName: infoData.vars?.sv_hostname || "Tokyo Edge Roleplay",
          lastRestart: new Date().toISOString(),
          ping: dynamicResponse.ok ? Math.round(Number(dynamicResponse.headers.get('X-Response-Time') || 30)) : 30,
          resources: resourcesCount,
          // Estatísticas de jogadores com tratamento de erro
          playerStats: {
            total: playersData.length || 0,
            police: playersData.filter((p: any) => p && p.name && p.name.includes("COPE")).length || 0,
            medic: playersData.filter((p: any) => p && p.name && p.name.includes("SAMU")).length || 0,
            staff: playersData.filter((p: any) => p && p.name && p.name.startsWith("[STAFF]")).length || 0,
          }
        };
        
        // Armazenar último status conhecido para casos de falha
        await storage.upsertSetting({
          key: 'last_server_stats',
          value: JSON.stringify(stats),
          category: 'server'
        });
        
        broadcastUpdate(stats);
        return;
      } catch (fetchError) {
        // Se ocorrer um erro na requisição, limpar o timeout
        clearTimeout(timeoutId);
        console.warn('Não foi possível conectar ao servidor FiveM, tentando usar último status conhecido:', fetchError.message);
        
        // Tentar obter o último status conhecido
        const lastStats = await storage.getSetting('last_server_stats');
        if (lastStats && lastStats.value) {
          try {
            const stats = JSON.parse(lastStats.value);
            // Marcar que estamos usando dados em cache
            stats.cached = true;
            broadcastUpdate(stats);
            return;
          } catch (e) {
            console.error('Erro ao processar último status conhecido:', e);
          }
        }
        
        // Tentar obter configurações do servidor para fallback
        const getSetting = async (key: string, defaultValue: string) => {
          try {
            const setting = await storage.getSetting(key);
            return setting ? setting.value : defaultValue;
          } catch (e) {
            return defaultValue;
          }
        };
        
        const isOnlineSetting = await getSetting('server_online', 'false');
        const serverNameSetting = await getSetting('server_name', 'Tokyo Edge Roleplay');
        const maxPlayersSetting = await getSetting('server_max_players', '128');
        
        const isOnline = isOnlineSetting === 'true';
        const serverName = serverNameSetting;
        const maxPlayers = parseInt(maxPlayersSetting, 10);
        
        const stats = {
          type: 'server_stats',
          online: isOnline,
          players: 0,
          maxPlayers: maxPlayers,
          serverName: serverName,
          lastRestart: null,
          ping: 0,
          cached: false,
          error: "Servidor indisponível"
        };
        
        broadcastUpdate(stats);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do servidor:', error);
      
      // Em caso de erro grave, informar que o servidor está offline
      const stats = {
        type: 'server_stats',
        online: false,
        players: 0,
        maxPlayers: 128,
        serverName: "Tokyo Edge Roleplay",
        lastRestart: null,
        ping: 0,
        error: "Erro interno"
      };
      
      broadcastUpdate(stats);
    }
  };
  
  // Executar imediatamente e então a cada 30 segundos
  updateServerStats();
  setInterval(updateServerStats, 30000);

  // Rota para obter todos os usuários (protegida para admins)
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
  });

  // Rota para obter membros da equipe
  app.get('/api/admin/staff', isAdmin, async (req, res) => {
    try {
      const staff = await storage.getStaffMembers(true);
      res.json(staff);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      res.status(500).json({ message: 'Erro ao buscar membros da equipe' });
    }
  });

  // Rota para obter/alterar configurações do site
  app.get('/api/admin/settings', isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSettingsByCategory('site');
      res.json(settings);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      res.status(500).json({ message: 'Erro ao buscar configurações do site' });
    }
  });

  // Rotas da galeria de mídias
  app.get('/api/admin/media', isAdmin, async (req, res) => {
    try {
      const items = await storage.getMediaItems();
      res.json(items);
    } catch (error) {
      console.error('Error fetching media items:', error);
      res.status(500).json({ message: 'Erro ao buscar itens de mídia' });
    }
  });

  // Aprovar item de mídia
  app.post('/api/admin/media/:id/approve', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.approveMediaItem(id);
      
      if (!item) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }
      
      res.json({ success: true, item });
    } catch (error) {
      console.error('Error approving media item:', error);
      res.status(500).json({ message: 'Erro ao aprovar item de mídia' });
    }
  });

  // Excluir item de mídia
  app.delete('/api/admin/media/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMediaItem(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting media item:', error);
      res.status(500).json({ message: 'Erro ao excluir item de mídia' });
    }
  });

  // Middleware de autenticação
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    next();
  };
  
  // Rotas de Candidatura (Staff Applications)
  // Rota para enviar candidatura do usuário
  app.post("/api/applications", isAuthenticated, async (req, res) => {
    try {
      // Verificar se o usuário já possui uma candidatura pendente
      const existingApplications = await storage.getStaffApplicationsByUserId(req.user!.id);
      const hasPendingApplication = existingApplications.some(app => app.status === "pending");
      
      if (hasPendingApplication) {
        return res.status(400).json({ 
          message: "Você já possui uma candidatura pendente. Aguarde a análise da atual antes de enviar outra." 
        });
      }
      
      // Criar nova candidatura
      const applicationData = {
        userId: req.user!.id,
        position: req.body.position,
        experience: req.body.experience,
        reason: req.body.reason,
        additionalInfo: req.body.additionalInfo || "",
        status: "pending",
        adminNotes: "",
        reviewedBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const application = await storage.createStaffApplication(applicationData);
      res.status(201).json({ application, success: true });
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Erro ao criar candidatura" });
    }
  });
  
  // Obter candidaturas do usuário
  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      const applications = await storage.getStaffApplicationsByUserId(req.user!.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ message: "Erro ao buscar candidaturas" });
    }
  });
  
  // Rotas administrativas para gerenciar candidaturas
  app.get("/api/admin/applications", isAdmin, async (req, res) => {
    try {
      const status = req.query.status?.toString();
      const limit = parseInt(req.query.limit?.toString() || "10");
      const offset = parseInt(req.query.offset?.toString() || "0");
      
      const applications = await storage.getStaffApplications(status, limit, offset);
      
      // Enriquecer aplicações com dados do usuário
      const enrichedApplications = await Promise.all(applications.map(async (app) => {
        const user = await storage.getUser(app.userId);
        return {
          ...app,
          user: user ? {
            id: user.id,
            username: user.username,
            discordUsername: user.discordUsername,
            avatar: user.avatar,
          } : null
        };
      }));
      
      res.json(enrichedApplications);
    } catch (error) {
      console.error("Error fetching applications for admin:", error);
      res.status(500).json({ message: "Erro ao buscar candidaturas para administração" });
    }
  });

  // Obter detalhes de uma candidatura específica (admin)
  app.get("/api/admin/applications/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getStaffApplication(id);
      
      if (!application) {
        return res.status(404).json({ message: "Candidatura não encontrada" });
      }
      
      const user = await storage.getUser(application.userId);
      
      res.json({
        application,
        user: user ? {
          id: user.id,
          username: user.username,
          discordUsername: user.discordUsername,
          avatar: user.avatar,
          role: user.role
        } : null
      });
    } catch (error) {
      console.error("Error fetching application details for admin:", error);
      res.status(500).json({ message: "Erro ao buscar detalhes da candidatura" });
    }
  });

  // Atualizar status de uma candidatura (aprovar/rejeitar)
  app.patch("/api/admin/applications/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      
      // Validar status
      if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }
      
      const application = await storage.getStaffApplication(id);
      if (!application) {
        return res.status(404).json({ message: "Candidatura não encontrada" });
      }
      
      // Atualizar a candidatura
      const updatedApplication = await storage.updateStaffApplication(id, {
        status,
        adminNotes: adminNotes || application.adminNotes,
        reviewedBy: req.user!.id,
        updatedAt: new Date()
      });
      
      // Se aprovado, adicionar usuário como membro da staff
      if (status === "approved") {
        // Verificar se já existe um membro da staff com este userId
        const existingMember = await storage.getStaffMemberByUserId(application.userId);
        
        if (!existingMember) {
          const user = await storage.getUser(application.userId);
          if (user) {
            // Criar novo membro da staff
            await storage.createStaffMember({
              userId: user.id,
              name: user.username,
              position: application.position,
              role: "moderator", // Papel padrão para novos membros
              avatar: user.avatar || null,
              bio: "Novo membro da equipe",
              isActive: true,
              joinedAt: new Date(),
              displayOrder: 99, // Colocado no final da lista
            });
            
            // Atualizar papel do usuário
            await storage.updateUser(user.id, {
              role: "moderator"
            });
          }
        }
      }
      
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Erro ao atualizar candidatura" });
    }
  });

  // Rotas de Suporte (Tickets)

  // Get user tickets
  app.get('/api/user/tickets', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const tickets = await storage.getUserTickets(userId);
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      res.status(500).json({ message: 'Erro ao buscar tickets do usuário' });
    }
  });

  // Create new ticket
  app.post('/api/user/tickets', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const ticketData = insertTicketSchema.parse({
        userId,
        subject: req.body.title,
        message: req.body.message,
        department: req.body.category,
        priority: 'medium'
      });
      
      const ticket = await storage.createTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ message: 'Erro ao criar ticket' });
    }
  });

  // Get ticket details
  app.get('/api/user/tickets/:id', isAuthenticated, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket não encontrado' });
      }
      
      // Verificar se o ticket pertence ao usuário ou se é um admin
      if (ticket.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      const replies = await storage.getTicketReplies(ticketId);
      res.json({ ticket, replies });
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      res.status(500).json({ message: 'Erro ao buscar detalhes do ticket' });
    }
  });

  // Reply to ticket
  app.post('/api/user/tickets/:id/reply', isAuthenticated, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const ticket = await storage.getTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket não encontrado' });
      }
      
      // Verificar se o ticket pertence ao usuário ou se é um admin
      if (ticket.userId !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      const replyData = insertTicketReplySchema.parse({
        ticketId,
        userId,
        message: req.body.message,
        isStaff: req.user!.role === 'admin' || req.user!.role === 'moderator',
        attachments: req.body.attachments || null
      });
      
      const reply = await storage.createTicketReply(replyData);
      
      // Se for staff e o ticket estiver aberto, mudar status para "em processamento"
      if (replyData.isStaff && ticket.status === 'open') {
        await storage.updateTicket(ticketId, { status: 'processing' });
      }
      
      // Buscar dados do usuário para enriquecer a resposta
      const user = await storage.getUser(userId);
      
      const enrichedReply = {
        ...reply,
        user: user ? {
          id: user.id,
          username: user.username,
          discordUsername: user.discordUsername,
          avatar: user.avatar,
          role: user.role
        } : null
      };
      
      res.status(201).json(enrichedReply);
    } catch (error) {
      console.error('Error replying to ticket:', error);
      res.status(500).json({ message: 'Erro ao responder ticket' });
    }
  });

  // Close ticket
  app.post('/api/user/tickets/:id/close', isAuthenticated, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const ticket = await storage.getTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket não encontrado' });
      }
      
      // Verificar se o ticket pertence ao usuário ou se é um admin
      if (ticket.userId !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      const updatedTicket = await storage.closeTicket(ticketId, userId);
      res.json(updatedTicket);
    } catch (error) {
      console.error('Error closing ticket:', error);
      res.status(500).json({ message: 'Erro ao fechar ticket' });
    }
  });

  // Rotas de administração para tickets
  app.get('/api/admin/tickets', isAdmin, async (req, res) => {
    try {
      // Se status for 'all' ou undefined, não filtramos
      const statusParam = req.query.status?.toString();
      const status = statusParam === 'all' ? undefined : statusParam;
      const limit = parseInt(req.query.limit?.toString() || "20");
      const offset = parseInt(req.query.offset?.toString() || "0");
      
      console.log(`Buscando tickets com status: ${status || 'TODOS'}, limit: ${limit}, offset: ${offset}`);
      
      const tickets = await storage.getTickets(status, limit, offset);
      console.log(`Tickets encontrados: ${tickets.length}`);
      
      // Enriquecer tickets com dados do usuário
      const enrichedTickets = await Promise.all(tickets.map(async (ticket) => {
        const user = await storage.getUser(ticket.userId);
        return {
          ...ticket,
          user: user ? {
            id: user.id,
            username: user.username,
            discordUsername: user.discordUsername,
            avatar: user.avatar
          } : null
        };
      }));
      
      res.json({ tickets: enrichedTickets });
    } catch (error) {
      console.error('Error fetching admin tickets:', error);
      res.status(500).json({ message: 'Erro ao buscar tickets' });
    }
  });
  
  app.get('/api/admin/tickets/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicket(id);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket não encontrado' });
      }
      
      const user = await storage.getUser(ticket.userId);
      const replies = await storage.getTicketReplies(id);
      
      // Enriquecer respostas com dados do usuário
      const enrichedReplies = await Promise.all(replies.map(async (reply) => {
        const replyUser = await storage.getUser(reply.userId);
        return {
          ...reply,
          user: replyUser ? {
            id: replyUser.id,
            username: replyUser.username,
            discordUsername: replyUser.discordUsername,
            avatar: replyUser.avatar,
            role: replyUser.role
          } : null
        };
      }));
      
      res.json({ 
        ticket: {
          ...ticket,
          user: user ? {
            id: user.id,
            username: user.username,
            discordUsername: user.discordUsername,
            avatar: user.avatar
          } : null
        },
        replies: enrichedReplies 
      });
    } catch (error) {
      console.error('Error fetching admin ticket details:', error);
      res.status(500).json({ message: 'Erro ao buscar detalhes do ticket' });
    }
  });
  
  // Rota para atribuir ticket a um administrador
  app.patch('/api/admin/tickets/:id/assign', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const adminId = req.user!.id;
      
      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket não encontrado' });
      }
      
      const updatedTicket = await storage.updateTicket(id, { 
        assignedTo: adminId,
        status: 'processing'
      });
      
      // Adicionar uma mensagem automática informando que o admin assumiu o ticket
      const admin = await storage.getUser(adminId);
      const adminName = admin?.username || 'Administrador';
      
      await storage.createTicketReply({
        ticketId: id,
        userId: adminId,
        message: `${adminName} assumiu este ticket e está trabalhando nele.`,
        isStaff: true,
        isSystemMessage: true
      });
      
      res.json({ success: true, ticket: updatedTicket });
    } catch (error) {
      console.error('Error assigning ticket:', error);
      res.status(500).json({ message: 'Erro ao atribuir ticket' });
    }
  });
  
  // Responder a um ticket como administrador
  app.post('/api/admin/tickets/:id/reply', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const adminId = req.user!.id;
      
      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket não encontrado' });
      }
      
      // Se o ticket não estiver atribuído ao admin atual, atribuí-lo
      if (!ticket.assignedTo || ticket.assignedTo !== adminId) {
        await storage.updateTicket(id, {
          assignedTo: adminId,
          status: 'processing'
        });
      }
      
      // Criar resposta
      const reply = await storage.createTicketReply({
        ticketId: id,
        userId: adminId,
        message: req.body.message,
        isStaff: true,
        attachments: req.body.attachments || null
      });
      
      // Buscar dados do usuário para enriquecer a resposta
      const admin = await storage.getUser(adminId);
      
      const enrichedReply = {
        ...reply,
        user: admin ? {
          id: admin.id,
          username: admin.username,
          discordUsername: admin.discordUsername,
          avatar: admin.avatar,
          role: admin.role
        } : null
      };
      
      res.status(201).json(enrichedReply);
    } catch (error) {
      console.error('Error replying to ticket as admin:', error);
      res.status(500).json({ message: 'Erro ao responder ticket' });
    }
  });

  // Rotas de configurações do usuário
  app.patch('/api/auth/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userData = {
        username: req.body.username,
        password: req.body.password ? await bcrypt.hash(req.body.password, 10) : undefined
      };
      
      const updatedUser = await storage.updateUser(userId, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Atualização da sessão ocorre internamente por meio do passport
      // quando o usuário é modificado
      
      res.json({ 
        success: true, 
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          discordId: updatedUser.discordId,
          discordUsername: updatedUser.discordUsername,
          avatar: updatedUser.avatar,
          role: updatedUser.role
        } 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
  });

  // Configurações de aparência
  app.patch('/api/user/settings/appearance', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const settingKey = `appearance_${userId}`;
      
      // Salvar configurações como JSON
      await storage.upsertSetting({
        key: settingKey,
        value: JSON.stringify(req.body),
        category: 'user_settings'
      });
      
      res.json({ success: true, settings: req.body });
    } catch (error) {
      console.error('Error updating appearance settings:', error);
      res.status(500).json({ message: 'Erro ao atualizar configurações de aparência' });
    }
  });

  // Configurações do servidor
  app.patch('/api/user/settings/server', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const settingKey = `server_${userId}`;
      
      // Salvar configurações como JSON
      await storage.upsertSetting({
        key: settingKey,
        value: JSON.stringify(req.body),
        category: 'user_settings'
      });
      
      res.json({ success: true, settings: req.body });
    } catch (error) {
      console.error('Error updating server settings:', error);
      res.status(500).json({ message: 'Erro ao atualizar configurações do servidor' });
    }
  });

  // Configurações de integrações
  app.patch('/api/user/settings/integrations', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const settingKey = `integrations_${userId}`;
      
      // Salvar configurações como JSON
      await storage.upsertSetting({
        key: settingKey,
        value: JSON.stringify(req.body),
        category: 'user_settings'
      });
      
      res.json({ success: true, settings: req.body });
    } catch (error) {
      console.error('Error updating integrations settings:', error);
      res.status(500).json({ message: 'Erro ao atualizar configurações de integrações' });
    }
  });

  // Obter configurações do usuário
  app.get('/api/user/settings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Buscar todas as configurações do usuário
      const appearanceKey = `appearance_${userId}`;
      const serverKey = `server_${userId}`;
      const integrationsKey = `integrations_${userId}`;
      
      const [appearance, server, integrations] = await Promise.all([
        storage.getSetting(appearanceKey),
        storage.getSetting(serverKey),
        storage.getSetting(integrationsKey)
      ]);
      
      // Converter de volta para objetos
      const settings = {
        appearance: appearance ? JSON.parse(appearance.value) : null,
        server: server ? JSON.parse(server.value) : null,
        integrations: integrations ? JSON.parse(integrations.value) : null
      };
      
      res.json({ settings });
    } catch (error) {
      console.error('Error fetching user settings:', error);
      res.status(500).json({ message: 'Erro ao buscar configurações do usuário' });
    }
  });
  
  return httpServer;
}
