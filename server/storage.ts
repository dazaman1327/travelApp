import { conversations, type Conversation, type InsertConversation, type Message, type TravelPreferences } from "@shared/schema";

export interface IStorage {
  createConversation(data: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  addMessage(id: number, message: Message): Promise<Conversation>;
  updatePreferences(id: number, preferences: TravelPreferences): Promise<Conversation>;
}

export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation>;
  private currentId: number;

  constructor() {
    this.conversations = new Map();
    this.currentId = 1;
  }

  async createConversation(data: InsertConversation): Promise<Conversation> {
    const id = this.currentId++;
    const conversation: Conversation = {
      id,
      messages: data.messages ?? [],
      preferences: data.preferences ?? {},
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async addMessage(id: number, message: Message): Promise<Conversation> {
    const conversation = await this.getConversation(id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
    const updatedConversation = {
      ...conversation,
      messages: [...messages, message] as Message[],
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  async updatePreferences(id: number, preferences: TravelPreferences): Promise<Conversation> {
    const conversation = await this.getConversation(id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const currentPreferences = typeof conversation.preferences === 'object' ? conversation.preferences : {};
    const updatedConversation = {
      ...conversation,
      preferences: { ...currentPreferences, ...preferences } as TravelPreferences,
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }
}

export const storage = new MemStorage();