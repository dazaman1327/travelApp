import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  messages: jsonb("messages").notNull().default([]),
  preferences: jsonb("preferences").notNull().default({}),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface TravelPreferences {
  budget?: number;
  region?: string;
  activities?: string[];
}
