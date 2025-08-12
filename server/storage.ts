import { type CheckIn, type InsertCheckIn } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCheckIn(id: string): Promise<CheckIn | undefined>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  getAllCheckIns(): Promise<CheckIn[]>;
}

export class MemStorage implements IStorage {
  private checkIns: Map<string, CheckIn>;

  constructor() {
    this.checkIns = new Map();
  }

  async getCheckIn(id: string): Promise<CheckIn | undefined> {
    return this.checkIns.get(id);
  }

  async createCheckIn(insertCheckIn: InsertCheckIn): Promise<CheckIn> {
    const id = randomUUID();
    const checkIn: CheckIn = { 
      ...insertCheckIn, 
      id,
      createdAt: new Date()
    };
    this.checkIns.set(id, checkIn);
    return checkIn;
  }

  async getAllCheckIns(): Promise<CheckIn[]> {
    return Array.from(this.checkIns.values());
  }
}

export const storage = new MemStorage();
