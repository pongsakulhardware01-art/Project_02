import { Router } from "express";
import path from "path";
import fs from "fs";
import { getCachedSettings } from "../services/settingsService";
import { APP_VERSION } from "../../src/data";

const router = Router();

// GET /api/download-single-html
router.get("/download-single-html", (req, res) => {
  try {
    const distPath = path.join(process.cwd(), "dist");
    const indexPath = path.join(distPath, "index.html");

    if (!fs.existsSync(indexPath)) {
      return res.status(404).send(
        "<h3 style='font-family: sans-serif; text-align: center; margin-top: 50px;'>กรุณารอสักครู่หรือขอให้ระบบทำการ Build ก่อน เนื่องจากยังไม่พบไฟล์ index.html ในระบบ</h3>"
      );
    }

    let html = fs.readFileSync(indexPath, "utf-8");

    // Match links & scripts dynamically with optional leading slash
    const linkRegex = /<link\s+[^>]*href=["']\/?([^"']+\.css)["'][^>]*>/g;
    const scriptRegex = /<script\s+[^>]*src=["']\/?([^"']+\.js)["'][^>]*><\/script>/g;

    // Inline CSS
    html = html.replace(linkRegex, (match, urlPath) => {
      const fullPath = path.join(distPath, urlPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        return `<style>${content}</style>`;
      }
      return match;
    });

    // Inline JS
    html = html.replace(scriptRegex, (match, urlPath) => {
      const fullPath = path.join(distPath, urlPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        return `<script type="module">${content}</script>`;
      }
      return match;
    });

    // Embed current server settings so the standalone file works offline seamlessly
    const bakedState = getCachedSettings() || null;
    const bStateScript = `<script>window.BAKED_SETTINGS = ${JSON.stringify(bakedState)};</script>\n<head>`;
    html = html.replace("<head>", bStateScript);

    const versionSlug = (APP_VERSION || "latest").replace(/\s+/g, "_");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Pongsakul_Concrete_Calculator_${versionSlug}.html`
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err: any) {
    console.error("Export offline HTML error:", err);
    res.status(500).send("เกิดข้อผิดพลาดในการแพ็ครวมไฟล์ standalone HTML: " + String(err));
  }
});

export default router;
