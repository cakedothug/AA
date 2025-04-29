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
import { IStorage } from "./storage";
import { db, pool } from "./db";
import { eq, desc, and, gte, lte, like, sql, asc } from "drizzle-orm";
import session from "express-session";
import MySQLStore from "express-mysql-session";

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  
  constructor() {
    const sessionStore = MySQLStore(session);
    this.sessionStore = new sessionStore({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123123',
      database: 'thuglife',
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

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return user;
  }
  
  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.discordId, discordId))
      .limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // News methods
  async getNews(id: number): Promise<News | undefined> {
    const [article] = await db
      .select()
      .from(news)
      .where(eq(news.id, id))
      .limit(1);
    return article;
  }
  
  async getNewsBySlug(slug: string): Promise<News | undefined> {
    const [article] = await db
      .select()
      .from(news)
      .where(eq(news.slug, slug))
      .limit(1);
    return article;
  }
  
  async getNewsList(limit = 10, offset = 0, categoryId?: number): Promise<News[]> {
    let query = db
      .select()
      .from(news)
      .where(eq(news.published, true))
      .orderBy(desc(news.publishedAt))
      .limit(limit)
      .offset(offset);
    
    if (categoryId) {
      query = query.where(eq(news.categoryId, categoryId));
    }
    
    return await query;
  }
  
  async getFeaturedNews(limit = 3): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .where(and(eq(news.published, true), eq(news.featured, true)))
      .orderBy(desc(news.publishedAt))
      .limit(limit);
  }
  
  async createNews(article: InsertNews): Promise<News> {
    const [newArticle] = await db
      .insert(news)
      .values(article)
      .returning();
    return newArticle;
  }
  
  async updateNews(id: number, data: Partial<InsertNews>): Promise<News | undefined> {
    const [updatedArticle] = await db
      .update(news)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(news.id, id))
      .returning();
    return updatedArticle;
  }
  
  async deleteNews(id: number): Promise<boolean> {
    const result = await db
      .delete(news)
      .where(eq(news.id, id))
      .returning({ id: news.id });
    
    return result.length > 0;
  }
  
  // News Categories methods
  async getNewsCategory(id: number): Promise<NewsCategory | undefined> {
    const [category] = await db
      .select()
      .from(newsCategories)
      .where(eq(newsCategories.id, id))
      .limit(1);
    return category;
  }
  
  async getNewsCategoryBySlug(slug: string): Promise<NewsCategory | undefined> {
    const [category] = await db
      .select()
      .from(newsCategories)
      .where(eq(newsCategories.slug, slug))
      .limit(1);
    return category;
  }
  
  async getNewsCategories(): Promise<NewsCategory[]> {
    return await db
      .select()
      .from(newsCategories);
  }
  
  async createNewsCategory(category: InsertNewsCategory): Promise<NewsCategory> {
    const [newCategory] = await db
      .insert(newsCategories)
      .values(category)
      .returning();
    return newCategory;
  }
  
  async updateNewsCategory(id: number, data: Partial<InsertNewsCategory>): Promise<NewsCategory | undefined> {
    const [updatedCategory] = await db
      .update(newsCategories)
      .set(data)
      .where(eq(newsCategories.id, id))
      .returning();
    return updatedCategory;
  }
  
  async deleteNewsCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(newsCategories)
      .where(eq(newsCategories.id, id))
      .returning({ id: newsCategories.id });
    
    return result.length > 0;
  }
  
  // Staff Applications methods
  async getStaffApplication(id: number): Promise<StaffApplication | undefined> {
    const [application] = await db
      .select()
      .from(staffApplications)
      .where(eq(staffApplications.id, id))
      .limit(1);
    return application;
  }
  
  async getStaffApplicationsByUserId(userId: number): Promise<StaffApplication[]> {
    return await db
      .select()
      .from(staffApplications)
      .where(eq(staffApplications.userId, userId))
      .orderBy(desc(staffApplications.createdAt));
  }
  
  async getStaffApplications(status?: string, limit = 10, offset = 0): Promise<StaffApplication[]> {
    let query = db
      .select()
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
    const [newApplication] = await db
      .insert(staffApplications)
      .values({
        ...application,
        status: "pending",
        adminNotes: "",
        reviewedBy: null
      })
      .returning();
    return newApplication;
  }
  
  async updateStaffApplication(id: number, data: Partial<StaffApplication>): Promise<StaffApplication | undefined> {
    const [updatedApplication] = await db
      .update(staffApplications)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(staffApplications.id, id))
      .returning();
    return updatedApplication;
  }
  
  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return setting;
  }
  
  async getSettingsByCategory(category: string): Promise<Setting[]> {
    return await db
      .select()
      .from(settings)
      .where(eq(settings.category, category));
  }
  
  async getAllSettings(): Promise<Setting[]> {
    return await db
      .select()
      .from(settings);
  }
  
  async upsertSetting(data: InsertSetting): Promise<Setting> {
    // Verificar se o setting já existe
    const existingSetting = await this.getSetting(data.key);
    
    if (existingSetting) {
      // Atualizar setting existente
      const [updatedSetting] = await db
        .update(settings)
        .set({ value: data.value })
        .where(eq(settings.key, data.key))
        .returning();
      return updatedSetting;
    } else {
      // Criar novo setting
      const [newSetting] = await db
        .insert(settings)
        .values(data)
        .returning();
      return newSetting;
    }
  }
  
  // Staff Members methods
  async getStaffMember(id: number): Promise<StaffMember | undefined> {
    const [member] = await db
      .select()
      .from(staffMembers)
      .where(eq(staffMembers.id, id))
      .limit(1);
    return member;
  }
  
  async getStaffMemberByUserId(userId: number): Promise<StaffMember | undefined> {
    const [member] = await db
      .select()
      .from(staffMembers)
      .where(eq(staffMembers.userId, userId))
      .limit(1);
    return member;
  }
  
  async getStaffMembers(activeOnly: boolean = false): Promise<StaffMember[]> {
    let query = db
      .select()
      .from(staffMembers)
      .orderBy(asc(staffMembers.displayOrder));
    
    if (activeOnly) {
      query = query.where(eq(staffMembers.isActive, true));
    }
    
    return await query;
  }
  
  async createStaffMember(member: InsertStaffMember): Promise<StaffMember> {
    const [newMember] = await db
      .insert(staffMembers)
      .values(member)
      .returning();
    return newMember;
  }
  
  async updateStaffMember(id: number, data: Partial<InsertStaffMember>): Promise<StaffMember | undefined> {
    const [updatedMember] = await db
      .update(staffMembers)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(staffMembers.id, id))
      .returning();
    return updatedMember;
  }
  
  async deleteStaffMember(id: number): Promise<boolean> {
    const result = await db
      .delete(staffMembers)
      .where(eq(staffMembers.id, id))
      .returning({ id: staffMembers.id });
    
    return result.length > 0;
  }

  // Ticket methods
  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);
    return ticket;
  }

  async getTickets(status?: string, limit = 10, offset = 0): Promise<Ticket[]> {
    let query = db
      .select()
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
    return await db
      .select()
      .from(tickets)
      .where(eq(tickets.userId, userId))
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [newTicket] = await db
      .insert(tickets)
      .values({
        ...ticket,
        status: "open",
        assignedTo: null
      })
      .returning();
    return newTicket;
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket | undefined> {
    const [updatedTicket] = await db
      .update(tickets)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket;
  }

  async closeTicket(id: number, userId: number): Promise<Ticket | undefined> {
    const [closedTicket] = await db
      .update(tickets)
      .set({
        status: "closed",
        closedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
    return closedTicket;
  }
  
  // Ticket Replies methods
  async getTicketReplies(ticketId: number): Promise<TicketReply[]> {
    return await db
      .select()
      .from(ticketReplies)
      .where(eq(ticketReplies.ticketId, ticketId))
      .orderBy(asc(ticketReplies.createdAt));
  }

  async createTicketReply(reply: InsertTicketReply): Promise<TicketReply> {
    const [newReply] = await db
      .insert(ticketReplies)
      .values(reply)
      .returning();
    
    // Update ticket status if staff reply
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
    
    return newReply;
  }

  // Media Gallery methods
  async getMediaItems(type?: string, limit = 20, offset = 0): Promise<MediaGallery[]> {
    let query = db
      .select()
      .from(mediaGallery)
      .where(eq(mediaGallery.approved, true))
      .orderBy(desc(mediaGallery.createdAt))
      .limit(limit)
      .offset(offset);
    
    if (type) {
      query = query.where(eq(mediaGallery.type, type));
    }
    
    return await query;
  }

  async getMediaItem(id: number): Promise<MediaGallery | undefined> {
    const [item] = await db
      .select()
      .from(mediaGallery)
      .where(eq(mediaGallery.id, id))
      .limit(1);
    return item;
  }

  async createMediaItem(item: InsertMediaGallery): Promise<MediaGallery> {
    const [newItem] = await db
      .insert(mediaGallery)
      .values({
        ...item,
        approved: false,
        featured: false
      })
      .returning();
    return newItem;
  }

  async approveMediaItem(id: number): Promise<MediaGallery | undefined> {
    const [approvedItem] = await db
      .update(mediaGallery)
      .set({
        approved: true
      })
      .where(eq(mediaGallery.id, id))
      .returning();
    return approvedItem;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    const result = await db
      .delete(mediaGallery)
      .where(eq(mediaGallery.id, id))
      .returning({ id: mediaGallery.id });
    
    return result.length > 0;
  }

  // System Logs methods
  async createLog(log: InsertSystemLog): Promise<SystemLog> {
    const [newLog] = await db
      .insert(systemLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getLogs(limit = 100, offset = 0): Promise<SystemLog[]> {
    return await db
      .select()
      .from(systemLogs)
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Server Stats methods
  async createServerStat(stat: InsertServerStat): Promise<ServerStat> {
    const [newStat] = await db
      .insert(serverStats)
      .values(stat)
      .returning();
    return newStat;
  }

  async getServerStats(days = 7): Promise<ServerStat[]> {
    // Calcular data limite
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return await db
      .select()
      .from(serverStats)
      .where(gte(serverStats.recordDate, date))
      .orderBy(asc(serverStats.recordDate));
  }
}