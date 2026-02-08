import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import basicSsl from '@vitejs/plugin-basic-ssl';
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// AI NOTE: Use a stable project root for Vite paths instead of import.meta.dirname for Node ESM compatibility.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => ({
  plugins: [
    basicSsl(),
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
      ? [
        (await import("@replit/vite-plugin-cartographer")).cartographer(),
        (await import("@replit/vite-plugin-dev-banner")).devBanner(),
      ]
      : []),
  ],

  resolve: {
    alias: {
      // AI NOTE: Keep aliases anchored to the project root so /src/main.tsx resolves under client/.
      "@": path.resolve(projectRoot, "client", "src"),
      "@shared": path.resolve(projectRoot, "shared"),
      "@assets": path.resolve(projectRoot, "attached_assets"),
    },
  },

  // AI NOTE: Explicitly set Vite root to ./client (absolute) to resolve /src/main.tsx correctly.
  root: path.resolve(projectRoot, "client"),

  build: {
    // AI NOTE: Keep build output rooted at the project folder.
    outDir: path.resolve(projectRoot, "dist/public"),
    emptyOutDir: true,
  },

  server: {
    host: true,          // 👈 allows access from phone (LAN)
    port: 3000,
    strictPort: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
}));
