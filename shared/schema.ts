import { mysqlTable, serial, text, timestamp, varchar, int, boolean, json } from 'drizzle-orm/mysql-core';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// USUÁRIOS
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  discordId: varchar("discord_id", { length: 255 }).unique(),
  discordUsername: varchar("discord_username", { length: 255 }),
  avatar: varchar("avatar", { length: 255 }),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  permissions: json("permissions").$type<string[]>().default([]),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// NOTÍCIAS
export const news = mysqlTable("news", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  coverImage: varchar("cover_image", { length: 255 }).notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  scheduledFor: timestamp("scheduled_for"),
  authorId: int("author_id").references(() => users.id),
  categoryId: int("category_id").references(() => newsCategories.id),
  published: boolean("published").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  views: int("views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

// CATEGORIAS DE NOTÍCIAS
export const newsCategories = mysqlTable("news_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  color: varchar("color", { length: 20 }).notNull().default("#00E5FF"),
});

export const insertNewsCategorySchema = createInsertSchema(newsCategories).omit({
  id: true,
});

// CANDIDATURAS STAFF
export const staffApplications = mysqlTable("staff_applications", {
  id: serial("id").primaryKey(),
  userId: int("user_id").references(() => users.id),
  age: int("age").notNull(),
  timezone: varchar("timezone", { length: 255 }).notNull(),
  languages: text("languages").notNull(),
  availability: int("availability").notNull(),
  rpExperience: text("rp_experience").notNull(),
  moderationExperience: text("moderation_experience").notNull(),
  positionInterest: varchar("position_interest", { length: 255 }).notNull(),
  whyJoin: text("why_join").notNull(),
  skills: text("skills").notNull(),
  additionalInfo: text("additional_info"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  adminNotes: text("admin_notes"),
  reviewedBy: int("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStaffApplicationSchema = createInsertSchema(staffApplications).omit({
  id: true,
  status: true,
  adminNotes: true,
  reviewedBy: true,
  createdAt: true,
  updatedAt: true,
});

// CONFIGURAÇÕES DO SITE
export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(),
  value: text("value").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
});

// MEMBROS DA EQUIPE
export const staffMembers = mysqlTable("staff_members", {
  id: serial("id").primaryKey(),
  userId: int("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }).notNull(),
  avatar: varchar("avatar", { length: 255 }),
  bio: text("bio"),
  icon: varchar("icon", { length: 255 }).default(""),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  displayOrder: int("display_order").default(999),
  isActive: boolean("is_active").default(true),
  socialLinks: json("social_links").$type<{
    discord?: string;
    twitter?: string;
    instagram?: string;
    twitch?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStaffMemberSchema = createInsertSchema(staffMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// SISTEMAS DE TICKETS
export const tickets = mysqlTable("tickets", {
  id: serial("id").primaryKey(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  userId: int("user_id").references(() => users.id).notNull(),
  assignedTo: int("assigned_to").references(() => users.id),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  priority: varchar("priority", { length: 50 }).default("medium").notNull(),
  department: varchar("department", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  assignedTo: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  closedAt: true,
});

// RESPOSTAS DE TICKETS
export const ticketReplies = mysqlTable("ticket_replies", {
  id: serial("id").primaryKey(),
  ticketId: int("ticket_id").references(() => tickets.id).notNull(),
  userId: int("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isStaff: boolean("is_staff").default(false).notNull(),
  isSystemMessage: boolean("is_system_message").default(false).notNull(),
  attachments: json("attachments").$type<Array<{
    url: string;
    type: string; // 'image', 'video', 'document'
    filename: string;
    size?: number;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTicketReplySchema = createInsertSchema(ticketReplies).omit({
  id: true,
  createdAt: true,
});

// GALERIA DE MÍDIA
export const mediaGallery = mysqlTable("media_gallery", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  thumbnail: varchar("thumbnail", { length: 255 }),
  userId: int("user_id").references(() => users.id).notNull(),
  approved: boolean("approved").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMediaGallerySchema = createInsertSchema(mediaGallery).omit({
  id: true,
  approved: true,
  featured: true,
  createdAt: true,
});

// LOGS DO SISTEMA
export const systemLogs = mysqlTable("system_logs", {
  id: serial("id").primaryKey(),
  userId: int("user_id").references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(),
  entity: varchar("entity", { length: 255 }).notNull(),
  entityId: int("entity_id"),
  details: json("details"),
  ip: varchar("ip", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  createdAt: true,
});

// ESTATÍSTICAS DO SERVIDOR
export const serverStats = mysqlTable("server_stats", {
  id: serial("id").primaryKey(),
  players: int("players").notNull(),
  maxPlayers: int("max_players").notNull(),
  peak: int("peak").notNull().default(0),
  tps: varchar("tps", {length: 10}).notNull(),
  uptime: int("uptime").notNull(),
  restarts: int("restarts").notNull().default(0),
  recordDate: timestamp("record_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServerStatSchema = createInsertSchema(serverStats).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

export type NewsCategory = typeof newsCategories.$inferSelect;
export type InsertNewsCategory = z.infer<typeof insertNewsCategorySchema>;

export type StaffApplication = typeof staffApplications.$inferSelect;
export type InsertStaffApplication = z.infer<typeof insertStaffApplicationSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type StaffMember = typeof staffMembers.$inferSelect;
export type InsertStaffMember = z.infer<typeof insertStaffMemberSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type TicketReply = typeof ticketReplies.$inferSelect;
export type InsertTicketReply = z.infer<typeof insertTicketReplySchema>;

export type MediaGallery = typeof mediaGallery.$inferSelect;
export type InsertMediaGallery = z.infer<typeof insertMediaGallerySchema>;

export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;

export type ServerStat = typeof serverStats.$inferSelect;
export type InsertServerStat = z.infer<typeof insertServerStatSchema>;

// DIRETRIZES & REGRAS
export const guidelines = mysqlTable("guidelines", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // police, safezones, actions, leadership, etc
  order: int("order").default(0).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  lastUpdatedBy: int("last_updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGuidelineSchema = createInsertSchema(guidelines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Guideline = typeof guidelines.$inferSelect;
export type InsertGuideline = z.infer<typeof insertGuidelineSchema>;