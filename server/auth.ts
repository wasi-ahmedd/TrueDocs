import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scryptSync } from "crypto";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import MemoryStore from "memorystore";

declare global {
    namespace Express {
        interface User extends SelectUser { }
    }
}

declare module 'express-session' {
    interface SessionData {
        authenticated: boolean; // Keep for legacy compatibility if needed
        encryptionKey: string; // The derived key for file encryption
    }
}

export function setupAuth(app: Express) {
    const SessionStore = MemoryStore(session);
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "govt_cards_super_secret_key",
        resave: false,
        saveUninitialized: false,
        store: new SessionStore({
            checkPeriod: 86400000 // prune expired entries every 24h
        }),
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            secure: process.env.NODE_ENV === "production",
        }
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1); // trust first proxy
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    // Track Last Active
    app.use(async (req, res, next) => {
        if (req.isAuthenticated() && req.user?.id) {
            // update asynchronously without blocking response
            storage.updateUser(req.user.id, { lastActive: new Date() }).catch(console.error);
        }
        next();
    });

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const user = await storage.getUserByUsername(username);
                if (!user) {
                    return done(null, false, { message: "User not found" });
                }

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    return done(null, false, { message: "Invalid password" });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }),
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // Hashing helper for encryption key
    // We use the USER'S salt and their PASSWORD to derive the key.
    // This key is never stored, only re-generated on login.
    function deriveEncryptionKey(password: string, salt: string) {
        // We can use scryptSync as in encryption.ts
        // In encryption.ts: getKey(password) -> scryptSync(password, SALT, 32)
        // Here we use the user-specific salt
        return crypto.scryptSync(password, salt, 32).toString('hex');
    }

    app.post("/api/register", async (req, res, next) => {
        try {
            if (!req.body.username || !req.body.password) {
                return res.status(400).send("Username and password are required");
            }

            const existingUser = await storage.getUserByUsername(req.body.username);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const salt = crypto.randomBytes(16).toString('hex');

            const user = await storage.createUser({
                username: req.body.username,
                password: hashedPassword,
                salt: salt
            });

            req.login(user, (err) => {
                if (err) return next(err);

                // Set encryption key in session
                const key = deriveEncryptionKey(req.body.password, salt);
                req.session.encryptionKey = key;
                req.session.authenticated = true;
                req.session.save((err) => {
                    if (err) return next(err);
                    res.json({ success: true, user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
                });
            });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/auth/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: SelectUser, info: any) => {
            console.log("Auth attempt:", { err, user, info });
            if (err) return next(err);
            if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });

            if (user.isBanned) {
                return res.status(403).json({ message: "This account is banned. Contact wasiahemadchoudhary@gmail.com" });
            }

            req.login(user, (err) => {
                if (err) return next(err);

                // Derive and store encryption key in session
                const password = req.body.password;
                const key = deriveEncryptionKey(password, user.salt);

                req.session.encryptionKey = key;
                req.session.authenticated = true;
                req.session.save((err) => {
                    if (err) return next(err);
                    res.json({ success: true, user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
                });
            });
        })(req, res, next);
    });

    app.post("/api/auth/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            req.session.destroy((err) => {
                if (err) return next(err);
                res.json({ success: true });
            });
        });
    });

    app.get("/api/user", (req, res) => {
        if (req.isAuthenticated()) {
            res.json(req.user);
        } else {
            res.status(401).send("Not logged in");
        }
    });

    app.delete("/api/user", async (req, res, next) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);

        try {
            const { password } = req.body;
            if (!password) return res.status(400).send("Password required");

            // Re-verify password
            const user = await storage.getUser(req.user.id);
            if (!user) return res.sendStatus(404);

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return res.status(403).send("Incorrect password");

            // Proceed with deletion
            await storage.deleteUser(user.id);

            // Destroy session
            req.logout((err) => {
                if (err) return next(err);
                req.session.destroy((err) => {
                    if (err) return next(err);
                    res.json({ success: true });
                });
            });
        } catch (err) {
            next(err);
        }
    });
}

import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).send("Admin access required");
    }
    next();
}
