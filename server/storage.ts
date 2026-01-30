import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  people, cards,
  type Person, type InsertPerson,
  type Card, type InsertCard,
  type PersonWithCards
} from "@shared/schema";

export interface IStorage {
  // People
  getPeople(): Promise<PersonWithCards[]>;
  getPerson(id: number): Promise<PersonWithCards | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  deletePerson(id: number): Promise<void>;

  // Cards
  createCard(card: InsertCard): Promise<Card>;
  deleteCard(id: number): Promise<void>;
  getPeopleWithCardType(type: string): Promise<PersonWithCards[]>;
}

export class DatabaseStorage implements IStorage {
  async getPeople(): Promise<PersonWithCards[]> {
    return await db.query.people.findMany({
      with: {
        cards: true,
      },
    });
  }

  async getPerson(id: number): Promise<PersonWithCards | undefined> {
    return await db.query.people.findFirst({
      where: eq(people.id, id),
      with: {
        cards: true,
      },
    });
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const [person] = await db
      .insert(people)
      .values(insertPerson)
      .returning();
    return person;
  }

  async deletePerson(id: number): Promise<void> {
    // Cascade delete cards first (if not handled by DB constraint)
    await db.delete(cards).where(eq(cards.personId, id));
    await db.delete(people).where(eq(people.id, id));
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const [card] = await db
      .insert(cards)
      .values(insertCard)
      .returning();
    return card;
  }

  async deleteCard(id: number): Promise<void> {
    await db.delete(cards).where(eq(cards.id, id));
  }

  async getPeopleWithCardType(type: string): Promise<PersonWithCards[]> {
    // Find all people who have at least one card of this type
    // And return them with ALL their cards (or just the matching one? User requirement: "Show all people who have that card")
    // Usually implies showing the person context.
    // Let's filter in DB.
    
    // 1. Get IDs of people having the card
    const cardsOfType = await db.select().from(cards).where(eq(cards.type, type));
    const personIds = [...new Set(cardsOfType.map(c => c.personId))];
    
    if (personIds.length === 0) return [];

    // 2. Fetch those people with all their cards
    const result = await db.query.people.findMany({
      where: (people, { inArray }) => inArray(people.id, personIds),
      with: {
        cards: true
      }
    });

    return result;
  }
}

export const storage = new DatabaseStorage();
