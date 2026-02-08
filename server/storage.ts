import { db } from "./db";
import { eq, sql, desc, and, isNull, isNotNull } from "drizzle-orm";
import { people, cards, type Person, type InsertPerson, type Card, type InsertCard, settings, customCardTypes, type CustomCardType, type InsertCustomCardType, type PersonWithCards, users, type User, type InsertUser, cryptoWallets, type CryptoWallet, type InsertCryptoWallet } from "@shared/schema";

export interface IStorage {
  // People
  getPeople(): Promise<PersonWithCards[]>;
  getPerson(id: number): Promise<PersonWithCards | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: number, person: InsertPerson): Promise<Person | undefined>;
  deletePerson(id: number): Promise<void>;

  // Cards
  createCard(card: InsertCard): Promise<Card>;
  deleteCard(id: number): Promise<void>;
  getPeopleWithCardType(type: string): Promise<PersonWithCards[]>;
  getCard(id: number): Promise<Card | undefined>;

  // Settings
  getSettings(): Promise<any[]>;
  getSetting(key: string): Promise<string | undefined>;
  createSetting(key: string, value: string): Promise<void>;
  updateSetting(key: string, value: string): Promise<void>;

  // Card Types
  getCardTypes(): Promise<CustomCardType[]>;
  createCardType(cardType: InsertCustomCardType): Promise<CustomCardType>;
  deleteCardType(id: number): Promise<void>;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  assignDataToUser(userId: number): Promise<void>;
  deleteUser(id: number): Promise<void>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getWallets(userId: number): Promise<CryptoWallet[]>;
  getDeletedWallets(userId: number): Promise<CryptoWallet[]>;
  createWallet(wallet: InsertCryptoWallet): Promise<CryptoWallet>;
  deleteWallet(id: number): Promise<void>;
  restoreWallet(id: number): Promise<void>;
  permanentDeleteWallet(id: number): Promise<void>;

  // Admin Stats
  getAllCardsCount(): Promise<number>;
  getAllWalletsCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.username, username),
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async assignDataToUser(userId: number): Promise<void> {
    // Migrate people
    await db.update(people)
      .set({ userId })
      .where(sql`${people.userId} IS NULL`);

    // Migrate custom card types (optional, but requested "all files")
    // If we have custom types they likely belong to the user
    await db.update(customCardTypes)
      .set({ userId })
      .where(sql`${customCardTypes.userId} IS NULL`);
  }

  async getPeople(userId?: number): Promise<PersonWithCards[]> {
    if (!userId) return []; // strict safety
    return await db.query.people.findMany({
      where: eq(people.userId, userId),
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

  async updatePerson(id: number, update: InsertPerson): Promise<Person | undefined> {
    const [person] = await db
      .update(people)
      .set(update)
      .where(eq(people.id, id))
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

  async getPeopleWithCardType(type: string, userId?: number): Promise<PersonWithCards[]> {
    if (!userId) return [];

    // Find all people who have at least one card of this type
    const cardsOfType = await db.select().from(cards).where(eq(cards.type, type));
    const personIds = Array.from(new Set(cardsOfType.map(c => c.personId)));

    if (personIds.length === 0) return [];

    const result = await db.query.people.findMany({
      where: (people, { and, eq, inArray }) => and(
        eq(people.userId, userId),
        inArray(people.id, personIds)
      ),
      with: {
        cards: true
      }
    });

    return result;
  }

  async getSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting?.value;
  }

  async createSetting(key: string, value: string): Promise<void> {
    await db.insert(settings).values({ key, value }).onConflictDoUpdate({
      target: settings.key,
      set: { value },
    });
  }

  async getSettings(): Promise<any[]> {
    return await db.select().from(settings);
  }

  async updateSetting(key: string, value: string): Promise<void> {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  }

  async getCard(id: number): Promise<Card | undefined> {
    return await db.query.cards.findFirst({
      where: eq(cards.id, id),
    });
  }

  async getCardTypes(userId?: number): Promise<CustomCardType[]> {
    // Return global defaults (userId is null) AND user specific types
    return await db.select().from(customCardTypes).where(
      userId
        ? sql`${customCardTypes.userId} IS NULL OR ${customCardTypes.userId} = ${userId}`
        : sql`${customCardTypes.userId} IS NULL`
    );
  }

  async createCardType(cardType: InsertCustomCardType): Promise<CustomCardType> {
    const [newCardType] = await db.insert(customCardTypes).values(cardType).returning();
    return newCardType;
  }

  async deleteCardType(id: number): Promise<void> {
    await db.delete(customCardTypes).where(eq(customCardTypes.id, id));
  }
  async deleteUser(id: number): Promise<void> {
    // 1. Get all people belonging to this user
    const userPeople = await db.select().from(people).where(eq(people.userId, id));

    // 2. Delete all cards for each person
    for (const person of userPeople) {
      await db.delete(cards).where(eq(cards.personId, person.id));
    }

    // 3. Delete all people
    await db.delete(people).where(eq(people.userId, id));

    // 4. Delete custom card types for this user
    await db.delete(customCardTypes).where(eq(customCardTypes.userId, id));

    // 5. Delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUser(id: number, update: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(update).where(eq(users.id, id)).returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    // We can't sort by createdAt if it's new and null for old users, but schema has defaultNow.
    // Existing users before migration will have null if column created without default update?
    // Drizzle defaultNow() usually applied at DB level.
    // Safe to order by ID for now to be sure.
    // Actually desc(users.id) implies newest first.
    return await db.select().from(users).orderBy(desc(users.id));
  }

  // --- CRYPTO WALLETS ---
  async getWallets(userId: number): Promise<CryptoWallet[]> {
    return await db.select().from(cryptoWallets).where(
      and(
        eq(cryptoWallets.userId, userId),
        isNull(cryptoWallets.deletedAt)
      )
    );
  }

  async getDeletedWallets(userId: number): Promise<CryptoWallet[]> {
    return await db.select().from(cryptoWallets).where(
      and(
        eq(cryptoWallets.userId, userId),
        isNotNull(cryptoWallets.deletedAt)
      )
    );
  }

  async createWallet(insertWallet: InsertCryptoWallet): Promise<CryptoWallet> {
    const [wallet] = await db.insert(cryptoWallets).values(insertWallet).returning();
    return wallet;
  }

  async deleteWallet(id: number): Promise<void> {
    // Soft delete
    await db.update(cryptoWallets)
      .set({ deletedAt: new Date() })
      .where(eq(cryptoWallets.id, id));
  }

  async restoreWallet(id: number): Promise<void> {
    await db.update(cryptoWallets)
      .set({ deletedAt: null })
      .where(eq(cryptoWallets.id, id));
  }

  async permanentDeleteWallet(id: number): Promise<void> {
    await db.delete(cryptoWallets).where(eq(cryptoWallets.id, id));
  }

  async getAllCardsCount(): Promise<number> {
    const allCards = await db.select().from(cards);
    return allCards.length;
  }

  async getAllWalletsCount(): Promise<number> {
    const allWallets = await db.select().from(cryptoWallets);
    return allWallets.length;
  }
}

export const storage = new DatabaseStorage();
