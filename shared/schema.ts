import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  personId: integer("person_id").notNull(),
  type: text("type").notNull(), // aadhaar, pan, voterid, ration
  filename: text("filename").notNull(),
});

export const peopleRelations = relations(people, ({ many }) => ({
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  person: one(people, {
    fields: [cards.personId],
    references: [people.id],
  }),
}));

export const insertPersonSchema = createInsertSchema(people).omit({ id: true });
export const insertCardSchema = createInsertSchema(cards).omit({ id: true });

export type Person = typeof people.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;

export type PersonWithCards = Person & { cards: Card[] };
