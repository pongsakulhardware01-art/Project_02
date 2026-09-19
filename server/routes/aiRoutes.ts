import { Router } from "express";
import {
  scanSlabsFromImage,
  parseSlabsFromText,
  scanUniversalFromImage,
  parseUniversalFromText,
} from "../services/aiService";

const router = Router();

// POST /api/scan-slabs
router.post("/scan-slabs", async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image || !mimeType) {
      return res.status(400).json({ error: "กรุณาส่งไฟล์ภาพและ mimeType เข้ามาในระบบ" });
    }

    const result = await scanSlabsFromImage(image, mimeType);
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/scan-slabs:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการแปลภาพด้วย AI: " + (error?.message || String(error)),
    });
  }
});

// POST /api/parse-slabs-text
router.post("/parse-slabs-text", async (req, res) => {
  try {
    const { text, normalPrice, mocPrice } = req.body;
    if (!text) {
      return res.status(400).json({ error: "กรุณาส่งข้อความแผ่นพื้นเข้ามาในระบบ" });
    }

    const result = await parseSlabsFromText(text, normalPrice, mocPrice);
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/parse-slabs-text:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการประมวลผลข้อความด้วย AI: " + (error?.message || String(error)),
    });
  }
});

// POST /api/scan-universal
router.post("/scan-universal", async (req, res) => {
  try {
    const { image, mimeType, customProducts } = req.body;
    if (!image || !mimeType) {
      return res.status(400).json({ error: "กรุณาส่งไฟล์ภาพและ mimeType เข้ามาในระบบ" });
    }

    const result = await scanUniversalFromImage(image, mimeType, customProducts);
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/scan-universal:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการแปลภาพเพื่อคำนวณราคา AI: " + (error?.message || String(error)),
    });
  }
});

// POST /api/parse-universal-text
router.post("/parse-universal-text", async (req, res) => {
  try {
    const { text, customProducts } = req.body;
    if (!text) {
      return res.status(400).json({ error: "กรุณาระบุข้อความสเปกในการส่งวิเคราะห์" });
    }

    const result = await parseUniversalFromText(text, customProducts);
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/parse-universal-text:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดคลาวด์ขณะแปลงข้อความเป็นโครงสร้าง AI: " + (error?.message || String(error)),
    });
  }
});

export default router;
