import { eq, sql, and, desc, asc, or, InferSelectModel } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import { MySqlRawQueryResult, MySql2Database, drizzle } from 'drizzle-orm/mysql2';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { config } from './config';
import { IStorage } from './storage';
import {
  users, User, InsertUser,
  news, News, InsertNews,
  newsCategories, NewsCategory, InsertNewsCategory,
  staffApplications, StaffApplication, InsertStaffApplication,
  settings, Setting, InsertSetting,
  staffMembers, StaffMember, InsertStaffMember,
  tickets, Ticket, InsertTicket,
  ticketReplies, TicketReply, InsertTicketReply,
  mediaGallery, MediaGallery, InsertMediaGallery,
  systemLogs, SystemLog, InsertSystemLog,
  serverStats, ServerStat, InsertServerStat
} from '@shared/schema';

/**
 * Implementação de armazenamento usando MySQL
 */
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  private db: MySql2Database;
  private connection: mysql.Pool;
  
  constructor() {
    // Criar conexão com o banco de dados
    this.connection = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '123123',
      database: process.env.MYSQL_DATABASE || 'thuglife',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Inicializar Drizzle ORM
    this.db = drizzle(this.connection);
    
    // Store de sessão
    const MySQLStore = MySQLStoreFactory(session);
    this.sessionStore = new MySQLStore({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '123123',
      database: process.env.MYSQL_DATABASE || 'thuglife',
      createDatabaseTable: true,
      schema: {
        tableName: 'sessions',
        columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data'
        }
      }
    });
  }

  // Métodos para usuários
  async getUser(id: number): Promise<User | undefined> {
    const results = await this.db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await this.db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const results = await this.db.select().from(users).where(eq(users.discordId, discordId));
    return results[0];
  }
  
  async getUsers(limit = 50, offset = 0): Promise<User[]> {
    const results = await this.db.select()
      .from(users)
      .orderBy(asc(users.id))
      .limit(limit)
      .offset(offset);
    
    return results;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser as any);
    const id = Number(result.insertId);
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    // MySQL não suporta .returning(), então precisamos fazer um select após o update
    await this.db.update(users).set(data as any).where(eq(users.id, id));
    const [updatedUser] = await this.db.select().from(users).where(eq(users.id, id));
    return updatedUser;
  }

  // Métodos para notícias
  async getNews(id: number): Promise<News | undefined> {
    const results = await this.db.select().from(news).where(eq(news.id, id));
    return results[0];
  }

  async getNewsBySlug(slug: string): Promise<News | undefined> {
    const results = await this.db.select().from(news).where(eq(news.slug, slug));
    return results[0];
  }

  async getNewsList(limit = 10, offset = 0, categoryId?: number): Promise<News[]> {
    let query = this.db.select().from(news).orderBy(desc(news.createdAt)).limit(limit).offset(offset);
    
    if (categoryId) {
      query = query.where(eq(news.categoryId, categoryId));
    }
    
    return await query;
  }

  async getFeaturedNews(limit = 3): Promise<News[]> {
    return await this.db.select()
      .from(news)
      .where(eq(news.featured, true))
      .orderBy(desc(news.createdAt))
      .limit(limit);
  }

  async createNews(article: InsertNews): Promise<News> {
    const result = await this.db.insert(news).values(article as any);
    const id = Number(result.insertId);
    const [createdNews] = await this.db.select().from(news).where(eq(news.id, id));
    return createdNews;
  }

  async updateNews(id: number, data: Partial<InsertNews>): Promise<News | undefined> {
    await this.db.update(news).set(data as any).where(eq(news.id, id));
    const [updatedNews] = await this.db.select().from(news).where(eq(news.id, id));
    return updatedNews;
  }

  async deleteNews(id: number): Promise<boolean> {
    await this.db.delete(news).where(eq(news.id, id));
    // No MySQL, verificamos se a exclusão foi bem-sucedida verificando
    // se o item ainda existe após a exclusão
    const check = await this.db.select().from(news).where(eq(news.id, id));
    return check.length === 0;
  }

  // Métodos para categorias de notícias
  async getNewsCategory(id: number): Promise<NewsCategory | undefined> {
    const results = await this.db.select().from(newsCategories).where(eq(newsCategories.id, id));
    return results[0];
  }

  async getNewsCategoryBySlug(slug: string): Promise<NewsCategory | undefined> {
    const results = await this.db.select().from(newsCategories).where(eq(newsCategories.slug, slug));
    return results[0];
  }

  async getNewsCategories(): Promise<NewsCategory[]> {
    return await this.db.select().from(newsCategories).orderBy(asc(newsCategories.name));
  }

  async createNewsCategory(category: InsertNewsCategory): Promise<NewsCategory> {
    const result = await this.db.insert(newsCategories).values(category as any);
    const id = Number(result.insertId);
    const [createdCategory] = await this.db.select().from(newsCategories).where(eq(newsCategories.id, id));
    return createdCategory;
  }

  async updateNewsCategory(id: number, data: Partial<InsertNewsCategory>): Promise<NewsCategory | undefined> {
    await this.db.update(newsCategories).set(data as any).where(eq(newsCategories.id, id));
    const [updatedCategory] = await this.db.select().from(newsCategories).where(eq(newsCategories.id, id));
    return updatedCategory;
  }

  async deleteNewsCategory(id: number): Promise<boolean> {
    await this.db.delete(newsCategories).where(eq(newsCategories.id, id));
    // No MySQL, verificamos se a exclusão foi bem-sucedida verificando 
    // se o item ainda existe após a exclusão
    const check = await this.db.select().from(newsCategories).where(eq(newsCategories.id, id));
    return check.length === 0;
  }

  // Métodos para aplicações de staff
  async getStaffApplication(id: number): Promise<StaffApplication | undefined> {
    const results = await this.db.select().from(staffApplications).where(eq(staffApplications.id, id));
    return results[0];
  }

  async getStaffApplicationsByUserId(userId: number): Promise<StaffApplication[]> {
    return await this.db.select()
      .from(staffApplications)
      .where(eq(staffApplications.userId, userId))
      .orderBy(desc(staffApplications.createdAt));
  }

  async getStaffApplications(status?: string, limit = 10, offset = 0): Promise<StaffApplication[]> {
    let query = this.db.select()
      .from(staffApplications)
      .orderBy(desc(staffApplications.createdAt))
      .limit(limit)
      .offset(offset);
    
    if (status) {
      query = query.where(eq(staffApplications.status, status));
    }
    
    return await query;
  }

  async createStaffApplication(application: InsertStaffApplication): Promise<StaffApplication> {
    const result = await this.db.insert(staffApplications).values(application as any);
    const id = Number(result.insertId);
    const [createdApplication] = await this.db.select().from(staffApplications).where(eq(staffApplications.id, id));
    return createdApplication;
  }

  async updateStaffApplication(id: number, data: Partial<StaffApplication>): Promise<StaffApplication | undefined> {
    await this.db.update(staffApplications).set({
      ...data,
      updatedAt: new Date()
    } as any).where(eq(staffApplications.id, id));
    
    const [updatedApplication] = await this.db.select().from(staffApplications).where(eq(staffApplications.id, id));
    return updatedApplication;
  }

  // Métodos para configurações
  async getSetting(key: string): Promise<Setting | undefined> {
    const results = await this.db.select().from(settings).where(eq(settings.key, key));
    return results[0];
  }

  async getSettingsByCategory(category: string): Promise<Setting[]> {
    return await this.db.select().from(settings).where(eq(settings.category, category));
  }

  async getAllSettings(): Promise<Setting[]> {
    return await this.db.select().from(settings).orderBy(asc(settings.category), asc(settings.key));
  }

  async upsertSetting(data: InsertSetting): Promise<Setting> {
    // Verificar se a configuração já existe
    const existingSettings = await this.db.select().from(settings).where(eq(settings.key, data.key));
    
    if (existingSettings.length > 0) {
      // Atualizar configuração existente
      await this.db.update(settings)
        .set({ value: data.value, category: data.category })
        .where(eq(settings.key, data.key));
      
      const [updatedSetting] = await this.db.select().from(settings).where(eq(settings.key, data.key));
      return updatedSetting;
    } else {
      // Criar nova configuração
      const result = await this.db.insert(settings).values(data as any);
      const id = Number(result.insertId);
      const [newSetting] = await this.db.select().from(settings).where(eq(settings.id, id));
      return newSetting;
    }
  }

  // Métodos para membros da equipe
  async getStaffMember(id: number): Promise<StaffMember | undefined> {
    const results = await this.db.select().from(staffMembers).where(eq(staffMembers.id, id));
    return results[0];
  }

  async getStaffMemberByUserId(userId: number): Promise<StaffMember | undefined> {
    const results = await this.db.select().from(staffMembers).where(eq(staffMembers.userId, userId));
    return results[0];
  }

  async getStaffMembers(activeOnly: boolean = false): Promise<StaffMember[]> {
    let query = this.db.select().from(staffMembers).orderBy(asc(staffMembers.displayOrder), asc(staffMembers.name));
    
    if (activeOnly) {
      query = query.where(eq(staffMembers.isActive, true));
    }
    
    return await query;
  }

  async createStaffMember(member: InsertStaffMember): Promise<StaffMember> {
    const result = await this.db.insert(staffMembers).values(member as any);
    const id = Number(result.insertId);
    const [createdMember] = await this.db.select().from(staffMembers).where(eq(staffMembers.id, id));
    return createdMember;
  }

  async updateStaffMember(id: number, data: Partial<InsertStaffMember>): Promise<StaffMember | undefined> {
    await this.db.update(staffMembers).set({
      ...data,
      updatedAt: new Date()
    } as any).where(eq(staffMembers.id, id));
    
    const [updatedMember] = await this.db.select().from(staffMembers).where(eq(staffMembers.id, id));
    return updatedMember;
  }

  async deleteStaffMember(id: number): Promise<boolean> {
    await this.db.delete(staffMembers).where(eq(staffMembers.id, id));
    // No MySQL, verificamos se a exclusão foi bem-sucedida verificando
    // se o item ainda existe após a exclusão
    const check = await this.db.select().from(staffMembers).where(eq(staffMembers.id, id));
    return check.length === 0;
  }

  // Tickets (suporte)
  async getTicket(id: number): Promise<Ticket | undefined> {
    const results = await this.db.select().from(tickets).where(eq(tickets.id, id));
    return results[0];
  }

  async getTickets(status?: string, limit = 10, offset = 0): Promise<Ticket[]> {
    let query = this.db.select()
      .from(tickets)
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);
    
    if (status) {
      query = query.where(eq(tickets.status, status));
    }
    
    return await query;
  }

  async getUserTickets(userId: number, limit = 10, offset = 0): Promise<Ticket[]> {
    return await this.db.select()
      .from(tickets)
      .where(eq(tickets.userId, userId))
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const result = await this.db.execute(sql`
      INSERT INTO tickets (user_id, subject, message, department, priority)
      VALUES (${ticket.userId}, ${ticket.subject}, ${ticket.message}, ${ticket.department}, ${ticket.priority || 'normal'})
    `);
    
    // Retornar o ticket recém-criado
    const id = typeof result.insertId === 'bigint' ? Number(result.insertId) : Number(result.insertId);
    const [createdTicket] = await this.db.select().from(tickets).where(eq(tickets.id, id));
    return createdTicket;
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket | undefined> {
    await this.db.update(tickets).set({
      ...data,
      updatedAt: new Date()
    } as any).where(eq(tickets.id, id));
    
    const [updatedTicket] = await this.db.select().from(tickets).where(eq(tickets.id, id));
    return updatedTicket;
  }

  async closeTicket(id: number, userId: number): Promise<Ticket | undefined> {
    await this.db.execute(sql`
      UPDATE tickets 
      SET status = 'closed', closed_at = NOW(), closed_by = ${userId}, updated_at = NOW()
      WHERE id = ${id}
    `);
    
    // No MySQL, verificamos se a atualização foi bem-sucedida buscando o ticket atualizado
    const [updatedTicket] = await this.db.select().from(tickets).where(eq(tickets.id, id));
    if (updatedTicket && updatedTicket.status === 'closed') {
      return updatedTicket;
    }
    
    return undefined;
  }

  async getTicketReplies(ticketId: number): Promise<TicketReply[]> {
    return await this.db.select()
      .from(ticketReplies)
      .where(eq(ticketReplies.ticketId, ticketId))
      .orderBy(asc(ticketReplies.createdAt));
  }

  async createTicketReply(reply: InsertTicketReply): Promise<TicketReply> {
    // No schema, o field é message, não content
    const result = await this.db.execute(sql`
      INSERT INTO ticket_replies (ticket_id, user_id, message)
      VALUES (${reply.ticketId}, ${reply.userId}, ${reply.message})
    `);
    
    // Retornar a resposta recém-criada
    const id = typeof result.insertId === 'bigint' ? Number(result.insertId) : Number(result.insertId);
    const [createdReply] = await this.db.select().from(ticketReplies).where(eq(ticketReplies.id, id));
    
    // Atualizar o status do ticket se a resposta for de um membro da equipe
    const user = await this.getUser(reply.userId);
    if (user && ['admin', 'moderator', 'support'].includes(user.role)) {
      const ticket = await this.getTicket(reply.ticketId);
      if (ticket && ticket.status === 'open') {
        await this.updateTicket(reply.ticketId, {
          status: 'in_progress',
          assignedTo: reply.userId
        });
      }
    }
    
    return createdReply;
  }

  // Media Gallery methods
  async getMediaItems(type?: string, limit = 20, offset = 0): Promise<MediaGallery[]> {
    let query = this.db.select()
      .from(mediaGallery)
      .orderBy(desc(mediaGallery.createdAt))
      .limit(limit)
      .offset(offset);
    
    if (type) {
      query = query.where(eq(mediaGallery.type, type));
    }
    
    return await query;
  }

  async getMediaItem(id: number): Promise<MediaGallery | undefined> {
    const results = await this.db.select().from(mediaGallery).where(eq(mediaGallery.id, id));
    return results[0];
  }

  async createMediaItem(item: InsertMediaGallery): Promise<MediaGallery> {
    const result = await this.db.execute(sql`
      INSERT INTO media_gallery (user_id, title, description, url, thumbnail, type)
      VALUES (${item.userId}, ${item.title}, ${item.description || null}, ${item.url}, 
              ${item.thumbnail || item.url}, ${item.type || 'image'})
    `);
    
    // Retornar o item recém-criado
    const id = typeof result.insertId === 'bigint' ? Number(result.insertId) : Number(result.insertId);
    const [createdItem] = await this.db.select().from(mediaGallery).where(eq(mediaGallery.id, id));
    return createdItem;
  }

  async approveMediaItem(id: number): Promise<MediaGallery | undefined> {
    await this.db.execute(sql`
      UPDATE media_gallery SET approved = true WHERE id = ${id}
    `);
    
    // No MySQL, verificamos se a atualização foi bem-sucedida buscando o item atualizado
    const [updatedItem] = await this.db.select().from(mediaGallery).where(eq(mediaGallery.id, id));
    if (updatedItem && updatedItem.approved) {
      return updatedItem;
    }
    
    return undefined;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    await this.db.delete(mediaGallery).where(eq(mediaGallery.id, id));
    // No MySQL, verificamos se a exclusão foi bem-sucedida verificando
    // se o item ainda existe após a exclusão
    const check = await this.db.select().from(mediaGallery).where(eq(mediaGallery.id, id));
    return check.length === 0;
  }

  // System Logs methods
  async createLog(log: InsertSystemLog): Promise<SystemLog> {
    const result = await this.db.execute(sql`
      INSERT INTO system_logs (action, entity, user_id, entity_id, details, ip)
      VALUES (${log.action}, ${log.entity}, ${log.userId || null}, ${log.entityId || null}, 
              ${JSON.stringify(log.details) || null}, ${log.ip || null})
    `);
    
    // Retornar o log recém-criado
    const id = typeof result.insertId === 'bigint' ? Number(result.insertId) : Number(result.insertId);
    const [createdLog] = await this.db.select().from(systemLogs).where(eq(systemLogs.id, id));
    return createdLog;
  }

  async getLogs(limit = 100, offset = 0): Promise<SystemLog[]> {
    return await this.db.select()
      .from(systemLogs)
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Server Stats methods
  async createServerStat(stat: InsertServerStat): Promise<ServerStat> {
    // Converter a data se for string
    const recordDate = typeof stat.recordDate === 'string' 
      ? new Date(stat.recordDate) 
      : stat.recordDate;
    
    const result = await this.db.execute(sql`
      INSERT INTO server_stats (record_date, players, peak, uptime, restarts)
      VALUES (${recordDate}, ${stat.players}, ${stat.peak}, ${stat.uptime}, ${stat.restarts})
    `);
    
    // Retornar a estatística recém-criada
    const id = typeof result.insertId === 'bigint' ? Number(result.insertId) : Number(result.insertId);
    const [createdStat] = await this.db.select().from(serverStats).where(eq(serverStats.id, id));
    return createdStat;
  }

  async getServerStats(days = 7): Promise<ServerStat[]> {
    // Calcular a data mínima (X dias atrás)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - days);
    
    return await this.db.select()
      .from(serverStats)
      .where(sql`record_date >= ${minDate.toISOString().split('T')[0]}`)
      .orderBy(asc(serverStats.recordDate));
  }

  // Guidelines methods
  async getGuideline(id: number): Promise<Guideline | undefined> {
    const results = await this.db.select().from(guidelines).where(eq(guidelines.id, id));
    return results[0];
  }

  async getGuidelineBySlug(slug: string): Promise<Guideline | undefined> {
    const results = await this.db.select().from(guidelines).where(eq(guidelines.slug, slug));
    return results[0];
  }

  async getGuidelines(type?: string, publishedOnly = true): Promise<Guideline[]> {
    let query = this.db.select().from(guidelines).orderBy(asc(guidelines.order));
    
    if (type) {
      query = query.where(eq(guidelines.type, type));
    }
    
    if (publishedOnly) {
      query = query.where(eq(guidelines.isPublished, true));
    }
    
    return await query;
  }

  async createGuideline(guideline: InsertGuideline): Promise<Guideline> {
    const result = await this.db.insert(guidelines).values(guideline as any);
    const id = Number(result.insertId);
    const [createdGuideline] = await this.db.select().from(guidelines).where(eq(guidelines.id, id));
    return createdGuideline;
  }

  async updateGuideline(id: number, data: Partial<InsertGuideline>): Promise<Guideline | undefined> {
    await this.db.update(guidelines).set({
      ...data,
      updatedAt: new Date()
    } as any).where(eq(guidelines.id, id));
    
    const [updatedGuideline] = await this.db.select().from(guidelines).where(eq(guidelines.id, id));
    return updatedGuideline;
  }

  async deleteGuideline(id: number): Promise<boolean> {
    await this.db.delete(guidelines).where(eq(guidelines.id, id));
    const check = await this.db.select().from(guidelines).where(eq(guidelines.id, id));
    return check.length === 0;
  }
}