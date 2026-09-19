import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { initFirebase } from "./server/config/database";
import { loadAndInitializeSettings, getCachedSettings } from "./server/services/settingsService";
import settingsRoutes from "./server/routes/settingsRoutes";
import aiRoutes from "./server/routes/aiRoutes";
import exportRoutes from "./server/routes/exportRoutes";
import { APP_VERSION } from "./src/data";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. High-limit JSON body parser for multimodal photo scanning
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // 2. Initialize Database & Global Cloud State
  initFirebase();
  await loadAndInitializeSettings();

  // 3. Mount Modular API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      version: APP_VERSION,
      cached: !!getCachedSettings(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api", settingsRoutes);
  app.use("/api", aiRoutes);
  app.use("/api", exportRoutes);

  // 4. Vite Middleware (Dev) or Static Asset Serving (Prod)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets from:", distPath);
  }

  // 5. Start listening on Port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pongsakul Server running (${APP_VERSION}) in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting Pongsakul Server:", err);
  process.exit(1);
});
