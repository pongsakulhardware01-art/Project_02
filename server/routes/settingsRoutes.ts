import { Router } from "express";
import {
  getSettings,
  saveSettings,
  getCloudStatus,
  testCloudSync,
} from "../services/settingsService";

const router = Router();

// GET /api/settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err: any) {
    console.error("Failed to get settings:", err);
    res.status(500).json({ error: "Could not retrieve settings" });
  }
});

// POST /api/settings
router.post("/settings", async (req, res) => {
  try {
    const newSettings = req.body;
    const saved = await saveSettings(newSettings);
    res.json({ success: true, settings: saved });
  } catch (err: any) {
    console.error("Failed to save settings:", err);
    res.status(500).json({ error: "Could not save settings on backend" });
  }
});

// GET /api/cloud-status
router.get("/cloud-status", async (req, res) => {
  try {
    const status = await getCloudStatus();
    res.json(status);
  } catch (err: any) {
    console.error("Failed to get cloud status:", err);
    res.status(500).json({ error: err?.message || "Failed to inspect cloud status" });
  }
});

// POST /api/cloud-test
router.post("/cloud-test", async (req, res) => {
  try {
    const result = await testCloudSync();
    res.json(result);
  } catch (err: any) {
    console.error("Cloud test error:", err);
    res.status(500).json({ success: false, error: err?.message || "Cloud test failed" });
  }
});

export default router;
