import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import express from 'express';
import path from 'path';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Static PDF serving
  const pdfPath = path.join(process.cwd(), 'pdfs');
  app.use('/pdfs', express.static(pdfPath));

  // People Routes
  app.get(api.people.list.path, async (req, res) => {
    const people = await storage.getPeople();
    res.json(people);
  });

  app.post(api.people.create.path, async (req, res) => {
    try {
      const input = api.people.create.input.parse(req.body);
      const person = await storage.createPerson(input);
      res.status(201).json(person);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.people.get.path, async (req, res) => {
    const person = await storage.getPerson(Number(req.params.id));
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    res.json(person);
  });

  app.delete(api.people.delete.path, async (req, res) => {
    // Check if exists first? Or just delete.
    const person = await storage.getPerson(Number(req.params.id));
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    await storage.deletePerson(Number(req.params.id));
    res.status(204).send();
  });

  // Cards Routes
  app.post(api.cards.create.path, async (req, res) => {
    try {
      const input = api.cards.create.input.parse(req.body);
      const card = await storage.createCard(input);
      res.status(201).json(card);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.cards.delete.path, async (req, res) => {
    await storage.deleteCard(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.cards.listByType.path, async (req, res) => {
    const type = req.params.type;
    const people = await storage.getPeopleWithCardType(type);
    res.json(people);
  });

  // Seed Data (if empty)
  const existingPeople = await storage.getPeople();
  if (existingPeople.length === 0) {
    console.log("Seeding database...");
    const p1 = await storage.createPerson({ name: "Shakeel Ahmed" });
    await storage.createCard({ personId: p1.id, type: "aadhaar", filename: "shakeel_aadhaar.pdf" });
    await storage.createCard({ personId: p1.id, type: "pan", filename: "shakeel_pan.pdf" });
    
    const p2 = await storage.createPerson({ name: "Priya Sharma" });
    await storage.createCard({ personId: p2.id, type: "aadhaar", filename: "priya_aadhaar.pdf" });
    await storage.createCard({ personId: p2.id, type: "voterid", filename: "priya_voterid.pdf" });
  }

  return httpServer;
}
