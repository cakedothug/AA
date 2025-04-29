import { 
  User, InsertUser, users,
  News, InsertNews, news,
  NewsCategory, InsertNewsCategory, newsCategories,
  StaffApplication, InsertStaffApplication, staffApplications,
  Setting, InsertSetting, settings,
  StaffMember, InsertStaffMember, staffMembers,
  Ticket, InsertTicket, tickets,
  TicketReply, InsertTicketReply, ticketReplies,
  MediaGallery, InsertMediaGallery, mediaGallery,
  SystemLog, InsertSystemLog, systemLogs,
  ServerStat, InsertServerStat, serverStats
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { config } from './config';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Propriedade de armazenamento de sessão
  sessionStore: session.Store;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  getUsers(limit?: number, offset?: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // News
  getNews(id: number): Promise<News | undefined>;
  getNewsBySlug(slug: string): Promise<News | undefined>;
  getNewsList(limit?: number, offset?: number, categoryId?: number): Promise<News[]>;
  getFeaturedNews(limit?: number): Promise<News[]>;
  createNews(article: InsertNews): Promise<News>;
  updateNews(id: number, data: Partial<InsertNews>): Promise<News | undefined>;
  deleteNews(id: number): Promise<boolean>;
  
  // News Categories
  getNewsCategory(id: number): Promise<NewsCategory | undefined>;
  getNewsCategoryBySlug(slug: string): Promise<NewsCategory | undefined>;
  getNewsCategories(): Promise<NewsCategory[]>;
  createNewsCategory(category: InsertNewsCategory): Promise<NewsCategory>;
  updateNewsCategory(id: number, data: Partial<InsertNewsCategory>): Promise<NewsCategory | undefined>;
  deleteNewsCategory(id: number): Promise<boolean>;
  
  // Staff Applications
  getStaffApplication(id: number): Promise<StaffApplication | undefined>;
  getStaffApplicationsByUserId(userId: number): Promise<StaffApplication[]>;
  getStaffApplications(status?: string, limit?: number, offset?: number): Promise<StaffApplication[]>;
  createStaffApplication(application: InsertStaffApplication): Promise<StaffApplication>;
  updateStaffApplication(id: number, data: Partial<StaffApplication>): Promise<StaffApplication | undefined>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  getSettingsByCategory(category: string): Promise<Setting[]>;
  getAllSettings(): Promise<Setting[]>;
  upsertSetting(data: InsertSetting): Promise<Setting>;
  
  // Staff Members
  getStaffMember(id: number): Promise<StaffMember | undefined>;
  getStaffMemberByUserId(userId: number): Promise<StaffMember | undefined>;
  getStaffMembers(activeOnly?: boolean): Promise<StaffMember[]>;
  createStaffMember(member: InsertStaffMember): Promise<StaffMember>;
  updateStaffMember(id: number, data: Partial<InsertStaffMember>): Promise<StaffMember | undefined>;
  deleteStaffMember(id: number): Promise<boolean>;
  
  // Tickets
  getTicket(id: number): Promise<Ticket | undefined>;
  getTickets(status?: string, limit?: number, offset?: number): Promise<Ticket[]>;
  getUserTickets(userId: number, limit?: number, offset?: number): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket | undefined>;
  closeTicket(id: number, userId: number): Promise<Ticket | undefined>;
  
  // Ticket Replies
  getTicketReplies(ticketId: number): Promise<TicketReply[]>;
  createTicketReply(reply: InsertTicketReply): Promise<TicketReply>;
  
  // Media Gallery
  getMediaItems(type?: string, limit?: number, offset?: number): Promise<MediaGallery[]>;
  getMediaItem(id: number): Promise<MediaGallery | undefined>;
  createMediaItem(item: InsertMediaGallery): Promise<MediaGallery>;
  approveMediaItem(id: number): Promise<MediaGallery | undefined>;
  deleteMediaItem(id: number): Promise<boolean>;
  
  // System Logs
  createLog(log: InsertSystemLog): Promise<SystemLog>;
  getLogs(limit?: number, offset?: number): Promise<SystemLog[]>;
  
  // Server Stats
  createServerStat(stat: InsertServerStat): Promise<ServerStat>;
  getServerStats(days?: number): Promise<ServerStat[]>;
  
  // Guidelines (Diretrizes & Regras)
  getGuideline(id: number): Promise<Guideline | undefined>;
  getGuidelineBySlug(slug: string): Promise<Guideline | undefined>;
  getGuidelines(type?: string, publishedOnly?: boolean): Promise<Guideline[]>;
  createGuideline(guideline: InsertGuideline): Promise<Guideline>;
  updateGuideline(id: number, data: Partial<InsertGuideline>): Promise<Guideline | undefined>;
  deleteGuideline(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  public sessionStore: session.Store;
  
  private users: Map<number, User>;
  private newsList: Map<number, News>;
  private newsCategories: Map<number, NewsCategory>;
  private staffApplications: Map<number, StaffApplication>;
  private settings: Map<string, Setting>;
  private staffMembers: Map<number, StaffMember>;
  private tickets: Map<number, Ticket>;
  private ticketReplies: Map<number, TicketReply[]>;
  private mediaItems: Map<number, MediaGallery>;
  private logs: Map<number, SystemLog>;
  private serverStatistics: Map<string, ServerStat>;
  
  private userIdCounter: number;
  private newsIdCounter: number;
  private newsCategoryIdCounter: number;
  private staffApplicationIdCounter: number;
  private settingIdCounter: number;
  private staffMemberIdCounter: number;
  private ticketIdCounter: number;
  private ticketReplyIdCounter: number;
  private mediaItemIdCounter: number;
  private logIdCounter: number;
  private serverStatIdCounter: number;

  constructor() {
    this.users = new Map();
    this.newsList = new Map();
    this.newsCategories = new Map();
    this.staffApplications = new Map();
    this.settings = new Map();
    this.staffMembers = new Map();
    this.tickets = new Map();
    this.ticketReplies = new Map();
    this.mediaItems = new Map();
    this.logs = new Map();
    this.serverStatistics = new Map();
    
    // Criar session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Limpar sessões expiradas a cada 24h
    });
    
    this.userIdCounter = 1;
    this.newsIdCounter = 1;
    this.newsCategoryIdCounter = 1;
    this.staffApplicationIdCounter = 1;
    this.settingIdCounter = 1;
    this.staffMemberIdCounter = 1;
    this.ticketIdCounter = 1;
    this.ticketReplyIdCounter = 1;
    this.mediaItemIdCounter = 1;
    this.logIdCounter = 1;
    this.serverStatIdCounter = 1;
    
    // Add some initial data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default admin user
    const adminUser = this.createUser({
      username: "thuglife",
      password: "$2b$10$SXbicuP.WeFBn1BUGJHbge4yU6hM1gLaCkRJq2tSrnhc461zzgEq.", // "thuglife"
      role: "admin",
      permissions: ["admin"],
      createdAt: new Date(),
      lastLogin: null,
      discordId: null,
      discordUsername: null,
      avatar: null
    });
    
    // Criar um usuário comum para testes
    const regularUser = this.createUser({
      username: "usuario_teste",
      password: "$2b$10$SXbicuP.WeFBn1BUGJHbge4yU6hM1gLaCkRJq2tSrnhc461zzgEq.", // "thuglife"
      role: "user",
      permissions: [],
      createdAt: new Date(),
      lastLogin: null,
      discordId: null,
      discordUsername: null,
      avatar: null
    });
    
    // Create default news categories
    const categories = [
      { name: "Atualização", slug: "atualizacao", color: "#00E5FF" },
      { name: "Evento", slug: "evento", color: "#a855f7" },
      { name: "Mecânica", slug: "mecanica", color: "#FF0A54" },
      { name: "Comunidade", slug: "comunidade", color: "#10B981" }
    ];
    
    categories.forEach(cat => this.createNewsCategory(cat));
    
    // Add default settings
    const defaultSettings = [
      // Configurações do servidor
      { key: "server_name", value: "Tokyo Edge Roleplay", category: "server" },
      { key: "server_description", value: "O servidor de GTA V mais imersivo com foco em roleplay brasileiro urbano", category: "server" },
      { key: "server_connection_url", value: "cfx.re/join/85e4q3", category: "server" },
      
      // Configurações do Discord
      { key: "discord_invite_url", value: "https://discord.gg/NZAAaAmQtC", category: "integration" },
      { key: "discord_oauth_enabled", value: "true", category: "integration" },
      { key: "discord_client_id", value: "", category: "integration" },
      { key: "discord_client_secret", value: "", category: "integration" },
      { key: "discord_callback_url", value: "http://45.89.30.198/api/auth/discord/callback", category: "integration" },
      { key: "discord_server_id", value: "", category: "integration" },
      { key: "discord_auth_scope", value: "identify email guilds", category: "integration" },
      
      // Configurações de aparência
      { key: "site_primary_color", value: "#FF0000", category: "appearance" },
      { key: "site_secondary_color", value: "#000000", category: "appearance" },
      { key: "homepage_hero_image", value: "", category: "appearance" },
      { key: "site_logo", value: "", category: "appearance" }
    ];
    
    defaultSettings.forEach(setting => this.upsertSetting(setting));
    
    // Add default staff members
    const staffMembers = [
      {
        name: "Fundador e Programador",
        role: "founder",
        position: "Fundador",
        userId: adminUser.id,
        avatar: "https://i.imgur.com/yQGJByM.png",
        bio: "Fundador do servidor Tokyo Edge Roleplay. Responsável pela administração e desenvolvimento.",
        icon: "triangle",
        displayOrder: 1,
        isActive: true,
        joinedAt: new Date("2023-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
        socialLinks: {
          discord: "fundador",
          twitter: "fundador_fivem"
        }
      },
      {
        name: "CEO Negrita",
        role: "admin",
        position: "CEO",
        avatar: "https://i.imgur.com/QP8Z4nL.png",
        bio: "CEO do servidor Tokyo Edge Roleplay. Responsável pela administração geral.",
        icon: "crown",
        displayOrder: 2,
        isActive: true,
        joinedAt: new Date("2023-02-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
        socialLinks: {
          discord: "ceo_discord"
        }
      },
      {
        name: "Cakee H.",
        role: "streaming",
        position: "Streaming e Mídia",
        avatar: "https://i.imgur.com/LU3Pfyr.png",
        bio: "Responsável pelo streaming e mídia do servidor.",
        icon: "streaming",
        displayOrder: 3,
        isActive: true,
        joinedAt: new Date("2023-03-10"),
        createdAt: new Date(),
        updatedAt: new Date(),
        socialLinks: {
          discord: "cakee_discord",
          twitch: "cakee_twitch"
        }
      },
      {
        name: "Chloe",
        role: "direction",
        position: "Diretora",
        avatar: "https://i.imgur.com/KvJ4St1.png",
        bio: "Diretora do servidor, responsável pela gestão estratégica.",
        icon: "brain",
        displayOrder: 4,
        isActive: true,
        joinedAt: new Date("2023-04-05"),
        createdAt: new Date(),
        updatedAt: new Date(),
        socialLinks: {
          discord: "chloe_discord"
        }
      }
    ];
    
    staffMembers.forEach(member => this.createStaffMember(member));
    
    // Adicionar alguns tickets de teste
    const testTickets = [
      {
        userId: regularUser.id,
        subject: "Problema ao conectar no servidor",
        message: "Estou tendo problemas para conectar no servidor. Quando tento entrar, recebo um erro de conexão. Já verifiquei minha internet e está tudo funcionando normalmente.",
        department: "Suporte Técnico",
        priority: "high"
      },
      {
        userId: regularUser.id,
        subject: "Dúvida sobre regras da cidade",
        message: "Gostaria de saber mais detalhes sobre as regras de roleplay da cidade, especialmente em relação ao uso de armas e assaltos.",
        department: "Informações",
        priority: "medium"
      },
      {
        userId: regularUser.id,
        subject: "Bug na mecânica de veículos",
        message: "Encontrei um bug na oficina mecânica. Quando tento consertar meu carro, os danos não são reparados mesmo após o pagamento.",
        department: "Bugs",
        priority: "medium"
      }
    ];
    
    // Criar tickets
    testTickets.forEach(ticket => this.createTicket(ticket));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.discordId === discordId,
    );
  }
  
  async getUsers(limit = 50, offset = 0): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => a.id - b.id)
      .slice(offset, offset + limit);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Garante que todos os campos necessários estão presentes
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password || null,
      discordId: insertUser.discordId || null,
      discordUsername: insertUser.discordUsername || null,
      avatar: insertUser.avatar || null,
      role: insertUser.role || 'user',
      permissions: insertUser.permissions || [],
      lastLogin: insertUser.lastLogin || null,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // News methods
  async getNews(id: number): Promise<News | undefined> {
    return this.newsList.get(id);
  }
  
  async getNewsBySlug(slug: string): Promise<News | undefined> {
    return Array.from(this.newsList.values()).find(
      (article) => article.slug === slug,
    );
  }
  
  async getNewsList(limit = 10, offset = 0, categoryId?: number): Promise<News[]> {
    let articles = Array.from(this.newsList.values())
      .filter(article => article.published)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    if (categoryId) {
      articles = articles.filter(article => article.categoryId === categoryId);
    }
    
    return articles.slice(offset, offset + limit);
  }
  
  async getFeaturedNews(limit = 3): Promise<News[]> {
    return Array.from(this.newsList.values())
      .filter(article => article.published)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
  
  async createNews(article: InsertNews): Promise<News> {
    const id = this.newsIdCounter++;
    const now = new Date();
    
    const newArticle: News = {
      id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      categoryId: article.categoryId || null,
      authorId: article.authorId || null,
      published: article.published || false,
      featured: article.featured || false,
      publishedAt: now,
      scheduledFor: article.scheduledFor || null,
      createdAt: now,
      updatedAt: now,
      views: 0
    };
    
    this.newsList.set(id, newArticle);
    return newArticle;
  }
  
  async updateNews(id: number, data: Partial<InsertNews>): Promise<News | undefined> {
    const article = await this.getNews(id);
    if (!article) return undefined;
    
    const updatedArticle = { 
      ...article, 
      ...data,
      updatedAt: new Date()
    };
    
    this.newsList.set(id, updatedArticle);
    return updatedArticle;
  }
  
  async deleteNews(id: number): Promise<boolean> {
    return this.newsList.delete(id);
  }
  
  // News Categories methods
  async getNewsCategory(id: number): Promise<NewsCategory | undefined> {
    return this.newsCategories.get(id);
  }
  
  async getNewsCategoryBySlug(slug: string): Promise<NewsCategory | undefined> {
    return Array.from(this.newsCategories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async getNewsCategories(): Promise<NewsCategory[]> {
    return Array.from(this.newsCategories.values());
  }
  
  async createNewsCategory(category: InsertNewsCategory): Promise<NewsCategory> {
    const id = this.newsCategoryIdCounter++;
    
    const newCategory: NewsCategory = {
      id,
      name: category.name,
      slug: category.slug,
      color: category.color || '#000000'
    };
    
    this.newsCategories.set(id, newCategory);
    return newCategory;
  }
  
  async updateNewsCategory(id: number, data: Partial<InsertNewsCategory>): Promise<NewsCategory | undefined> {
    const category = await this.getNewsCategory(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...data };
    this.newsCategories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteNewsCategory(id: number): Promise<boolean> {
    return this.newsCategories.delete(id);
  }
  
  // Staff Applications methods
  async getStaffApplication(id: number): Promise<StaffApplication | undefined> {
    return this.staffApplications.get(id);
  }
  
  async getStaffApplicationsByUserId(userId: number): Promise<StaffApplication[]> {
    return Array.from(this.staffApplications.values())
      .filter(application => application.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getStaffApplications(status?: string, limit = 10, offset = 0): Promise<StaffApplication[]> {
    let applications = Array.from(this.staffApplications.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (status) {
      applications = applications.filter(app => app.status === status);
    }
    
    return applications.slice(offset, offset + limit);
  }
  
  async createStaffApplication(application: InsertStaffApplication): Promise<StaffApplication> {
    const id = this.staffApplicationIdCounter++;
    const now = new Date();
    
    const newApplication: StaffApplication = {
      id,
      userId: application.userId,
      age: application.age,
      timezone: application.timezone,
      languages: application.languages,
      availability: application.availability,
      rpExperience: application.rpExperience,
      moderationExperience: application.moderationExperience,
      whyJoin: application.whyJoin,
      positionInterest: application.positionInterest,
      skills: application.skills,
      additionalInfo: application.additionalInfo || '',
      status: "pending",
      adminNotes: '',
      reviewedBy: null,
      createdAt: now,
      updatedAt: now
    };
    
    this.staffApplications.set(id, newApplication);
    return newApplication;
  }
  
  async updateStaffApplication(id: number, data: Partial<StaffApplication>): Promise<StaffApplication | undefined> {
    const application = await this.getStaffApplication(id);
    if (!application) return undefined;
    
    const updatedApplication = { 
      ...application, 
      ...data,
      updatedAt: new Date() 
    };
    
    this.staffApplications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }
  
  async getSettingsByCategory(category: string): Promise<Setting[]> {
    return Array.from(this.settings.values())
      .filter(setting => setting.category === category);
  }
  
  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }
  
  async upsertSetting(data: InsertSetting): Promise<Setting> {
    const existingSetting = this.settings.get(data.key);
    
    if (existingSetting) {
      const updatedSetting = { ...existingSetting, value: data.value };
      this.settings.set(data.key, updatedSetting);
      return updatedSetting;
    } else {
      const id = this.settingIdCounter++;
      const newSetting: Setting = { ...data, id };
      this.settings.set(data.key, newSetting);
      return newSetting;
    }
  }
  
  // Staff Members methods
  async getStaffMember(id: number): Promise<StaffMember | undefined> {
    return this.staffMembers.get(id);
  }
  
  async getStaffMemberByUserId(userId: number): Promise<StaffMember | undefined> {
    return Array.from(this.staffMembers.values()).find(
      (member) => member.userId === userId
    );
  }
  
  async getStaffMembers(activeOnly: boolean = false): Promise<StaffMember[]> {
    let members = Array.from(this.staffMembers.values())
      .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
    
    if (activeOnly) {
      members = members.filter(member => member.isActive);
    }
    
    return members;
  }
  
  async createStaffMember(member: InsertStaffMember): Promise<StaffMember> {
    const id = this.staffMemberIdCounter++;
    const now = new Date();
    
    // Garante que todos os campos necessários estão presentes
    const newMember: StaffMember = {
      id,
      name: member.name,
      role: member.role,
      position: member.position,
      avatar: member.avatar || null,
      userId: member.userId || null,
      bio: member.bio || null,
      icon: member.icon || null,
      joinedAt: member.joinedAt || now,
      displayOrder: member.displayOrder || null,
      isActive: member.isActive ?? true,
      socialLinks: member.socialLinks || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.staffMembers.set(id, newMember);
    return newMember;
  }
  
  async updateStaffMember(id: number, data: Partial<InsertStaffMember>): Promise<StaffMember | undefined> {
    const member = await this.getStaffMember(id);
    if (!member) return undefined;
    
    const updatedMember: StaffMember = { 
      ...member, 
      ...data,
      updatedAt: new Date() 
    };
    
    this.staffMembers.set(id, updatedMember);
    return updatedMember;
  }
  
  async deleteStaffMember(id: number): Promise<boolean> {
    return this.staffMembers.delete(id);
  }

  // Ticket methods
  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTickets(status?: string, limit = 10, offset = 0): Promise<Ticket[]> {
    let ticketList = Array.from(this.tickets.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (status) {
      ticketList = ticketList.filter(ticket => ticket.status === status);
    }
    
    return ticketList.slice(offset, offset + limit);
  }

  async getUserTickets(userId: number, limit = 10, offset = 0): Promise<Ticket[]> {
    return Array.from(this.tickets.values())
      .filter(ticket => ticket.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const id = this.ticketIdCounter++;
    const now = new Date();
    
    const newTicket: Ticket = {
      id,
      userId: ticket.userId,
      subject: ticket.subject,
      message: ticket.message,
      department: ticket.department,
      status: "open",
      priority: ticket.priority || "medium",
      createdAt: now,
      updatedAt: now,
      assignedTo: null,
      closedAt: null
    };
    
    this.tickets.set(id, newTicket);
    return newTicket;
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = await this.getTicket(id);
    if (!ticket) return undefined;
    
    const updatedTicket = {
      ...ticket,
      ...data,
      updatedAt: new Date()
    };
    
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async closeTicket(id: number, userId: number): Promise<Ticket | undefined> {
    const ticket = await this.getTicket(id);
    if (!ticket) return undefined;
    
    const closedTicket = {
      ...ticket,
      status: "closed",
      closedAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tickets.set(id, closedTicket);
    return closedTicket;
  }
  
  // Ticket Replies methods
  async getTicketReplies(ticketId: number): Promise<TicketReply[]> {
    const replies = this.ticketReplies.get(ticketId) || [];
    return [...replies].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createTicketReply(reply: InsertTicketReply): Promise<TicketReply> {
    const id = this.ticketReplyIdCounter++;
    const now = new Date();
    
    const newReply: TicketReply = {
      id,
      ticketId: reply.ticketId,
      userId: reply.userId,
      message: reply.message,
      createdAt: now
    };
    
    const existingReplies = this.ticketReplies.get(reply.ticketId) || [];
    this.ticketReplies.set(reply.ticketId, [...existingReplies, newReply]);
    
    // Update ticket status if staff reply
    const user = this.users.get(reply.userId);
    if (user && ['admin', 'moderator', 'support'].includes(user.role)) {
      const ticket = await this.getTicket(reply.ticketId);
      if (ticket && ticket.status === 'open') {
        await this.updateTicket(reply.ticketId, {
          status: 'in_progress',
          assignedTo: reply.userId
        });
      }
    }
    
    return newReply;
  }

  // Media Gallery methods
  async getMediaItems(type?: string, limit = 20, offset = 0): Promise<MediaGallery[]> {
    let mediaList = Array.from(this.mediaItems.values())
      .filter(item => item.approved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (type) {
      mediaList = mediaList.filter(item => item.type === type);
    }
    
    return mediaList.slice(offset, offset + limit);
  }

  async getMediaItem(id: number): Promise<MediaGallery | undefined> {
    return this.mediaItems.get(id);
  }

  async createMediaItem(item: InsertMediaGallery): Promise<MediaGallery> {
    const id = this.mediaItemIdCounter++;
    const now = new Date();
    
    const newItem: MediaGallery = {
      id,
      type: item.type,
      title: item.title,
      url: item.url,
      description: item.description || null,
      thumbnail: item.thumbnail || null,
      userId: item.userId,
      approved: false,
      featured: false,
      createdAt: now
    };
    
    this.mediaItems.set(id, newItem);
    return newItem;
  }

  async approveMediaItem(id: number): Promise<MediaGallery | undefined> {
    const item = await this.getMediaItem(id);
    if (!item) return undefined;
    
    const updatedItem = {
      ...item,
      approved: true
    };
    
    this.mediaItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    return this.mediaItems.delete(id);
  }

  // System Logs methods
  async createLog(log: InsertSystemLog): Promise<SystemLog> {
    const id = this.logIdCounter++;
    const now = new Date();
    
    const newLog: SystemLog = {
      id,
      action: log.action,
      entity: log.entity,
      userId: log.userId || null,
      entityId: log.entityId || null,
      details: log.details || null,
      ip: log.ip || null,
      createdAt: now
    };
    
    this.logs.set(id, newLog);
    return newLog;
  }

  async getLogs(limit = 100, offset = 0): Promise<SystemLog[]> {
    return Array.from(this.logs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  // Server Stats methods
  async createServerStat(stat: InsertServerStat): Promise<ServerStat> {
    const id = this.serverStatIdCounter++;
    const now = new Date();
    
    // Se a data de registro for uma string, converte para objeto Date
    const recordDate = typeof stat.recordDate === 'string' 
      ? new Date(stat.recordDate) 
      : stat.recordDate;
    
    const dateKey = recordDate.toISOString().split('T')[0];
    
    const newStat: ServerStat = {
      id,
      recordDate: recordDate,
      players: stat.players,
      peak: stat.peak,
      uptime: stat.uptime,
      restarts: stat.restarts,
      createdAt: now
    };
    
    this.serverStatistics.set(dateKey, newStat);
    return newStat;
  }

  async getServerStats(days = 7): Promise<ServerStat[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const minDateStr = date.toISOString().split('T')[0];
    
    return Array.from(this.serverStatistics.values())
      .filter(stat => {
        const statDateStr = stat.recordDate.toISOString().split('T')[0];
        return statDateStr >= minDateStr;
      })
      .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());
  }
  
  // Guidelines methods
  private guidelines: Map<number, Guideline> = new Map();
  private guidelineIdCounter: number = 1;

  async getGuideline(id: number): Promise<Guideline | undefined> {
    return this.guidelines.get(id);
  }

  async getGuidelineBySlug(slug: string): Promise<Guideline | undefined> {
    return Array.from(this.guidelines.values()).find(
      (guideline) => guideline.slug === slug
    );
  }

  async getGuidelines(type?: string, publishedOnly = true): Promise<Guideline[]> {
    let guidelines = Array.from(this.guidelines.values())
      .sort((a, b) => a.order - b.order);
    
    if (type) {
      guidelines = guidelines.filter(guideline => guideline.type === type);
    }

    if (publishedOnly) {
      guidelines = guidelines.filter(guideline => guideline.isPublished);
    }
    
    return guidelines;
  }

  async createGuideline(guideline: InsertGuideline): Promise<Guideline> {
    const id = this.guidelineIdCounter++;
    const now = new Date();
    
    const newGuideline: Guideline = {
      id,
      title: guideline.title,
      slug: guideline.slug,
      content: guideline.content,
      type: guideline.type,
      order: guideline.order || 0,
      isPublished: guideline.isPublished ?? true,
      lastUpdatedBy: guideline.lastUpdatedBy || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.guidelines.set(id, newGuideline);
    return newGuideline;
  }

  async updateGuideline(id: number, data: Partial<InsertGuideline>): Promise<Guideline | undefined> {
    const guideline = await this.getGuideline(id);
    if (!guideline) return undefined;
    
    const updatedGuideline = { 
      ...guideline, 
      ...data,
      updatedAt: new Date() 
    };
    
    this.guidelines.set(id, updatedGuideline);
    return updatedGuideline;
  }

  async deleteGuideline(id: number): Promise<boolean> {
    return this.guidelines.delete(id);
  }
}

// Escolha qual implementação usar com base no ambiente
let storage: IStorage;

// A importação do DatabaseStorage é feita dinamicamente para evitar problemas de dependência circular
if (config.server.isDev) {
  // Usar MemStorage para desenvolvimento
  storage = new MemStorage();
  console.log("Criação de tabelas simulada - usando storage em memória");
} else {
  // Importar e usar DatabaseStorage para produção
  import('./storage_db_mysql.js').then(module => {
    storage = new module.DatabaseStorage();
    console.log("Conectado ao banco de dados MySQL");
  }).catch(err => {
    console.error("Erro ao importar DatabaseStorage:", err);
    // Fallback para MemStorage em caso de erro
    storage = new MemStorage();
    console.warn("Usando MemStorage como fallback devido a erro de importação");
  });
}

export { storage };