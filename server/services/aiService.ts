import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("ไม่พบการตั้งค่า GEMINI_API_KEY ในระบบเซิร์ฟเวอร์ กรุณาตรวจสอบในเมนู Settings > Secrets");
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
      timeout: 35000,
    },
  });
}

const MODEL_CONFIGS = [
  { name: "gemini-3.1-flash-lite", thinkingLevel: ThinkingLevel.MINIMAL, timeoutMs: 12000 },
  { name: "gemini-4-hydrogen", thinkingLevel: ThinkingLevel.LOW, timeoutMs: 25000 },
  { name: "gemini-4-hydrogen", thinkingLevel: ThinkingLevel.LOW, timeoutMs: 25000, backoffMs: 800 },
];

async function generateJsonWithFallback(
  contents: any,
  systemInstruction: string,
  responseSchema: any
): Promise<any> {
  const ai = getGenAIClient();
  let lastError: any = null;

  for (const modelCfg of MODEL_CONFIGS) {
    if ("backoffMs" in modelCfg && modelCfg.backoffMs) {
      await new Promise((r) => setTimeout(r, modelCfg.backoffMs));
    }
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    try {
      const apiPromise = ai.models.generateContent({
        model: modelCfg.name,
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
          thinkingConfig: {
            thinkingLevel: modelCfg.thinkingLevel,
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`Timeout after ${modelCfg.timeoutMs}ms on ${modelCfg.name}`));
        }, modelCfg.timeoutMs);
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      if (timeoutHandle) clearTimeout(timeoutHandle);

      if (response && response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err: any) {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      const msg = err?.message || String(err);
      console.warn(`Error with model ${modelCfg.name}:`, msg);
      lastError = err;

      // Fail fast for invalid API key or permission errors
      if (/API_KEY_INVALID|PERMISSION_DENIED|"code":400|"code":403/i.test(msg)) {
        throw new Error("API Key ไม่ถูกต้องหรือไม่มีสิทธิ์ใช้งาน กรุณาตรวจสอบใน Settings > Secrets");
      }
    }
  }

  const finalMsg = lastError?.message || String(lastError || "");
  if (/RESOURCE_EXHAUSTED|"code":429/i.test(finalMsg)) {
    throw new Error("โควต้าการใช้งาน AI เต็มชั่วคราว (429) กรุณารอสักครู่แล้วลองใหม่อีกครั้ง");
  }
  if (/UNAVAILABLE|"code":503|high demand/i.test(finalMsg)) {
    throw new Error("เซิร์ฟเวอร์ AI มีผู้ใช้งานหนาแน่นชั่วคราว (503) กรุณาลองกดสแกนใหม่อีกครั้งครับ");
  }
  if (/Timeout/i.test(finalMsg)) {
    throw new Error("การประมวลผล AI ใช้เวลานานเกินกำหนด กรุณาลองลดขนาดภาพหรือสแกนใหม่อีกครั้ง");
  }

  throw lastError || new Error("ไม่สามารถเชื่อมต่อระบบวิเคราะห์ AI ได้ กรุณาลองใหม่อีกครั้ง");
}

/**
 * Scan prestressed concrete slabs from an image (handwritten note, table screenshot, or quotation)
 */
export async function scanSlabsFromImage(image: string, mimeType: string) {
  const imagePart = {
    inlineData: {
      mimeType,
      data: image,
    },
  };

  const systemInstruction =
    "You are an expert material estimator specializing in precast prestressed concrete slabs (แผ่นพื้นคอนกรีตสำเร็จรูปอัดแรง) for construction projects. " +
    "Analyze the image (handwritten list, printed quotation, table screenshot, or chat) and extract all precast concrete slabs (แผ่นพื้น/แผ่นพื้นสำเร็จรูป). " +
    "Standard width is 0.35m (35cm). Extract length in meters, quantity (count), boardType ('normal' or 'm.o.c'), " +
    "wireCount ('4', '5', '6', '7', '8', '5_mm_5', or 'auto' if unspecified — read exact wire count e.g. ลวด 4 เส้น -> '4', ลวด 5 เส้น -> '5', ลวด 5 มม. -> '5_mm_5'), " +
    "optional customPriceSqm (ราคา/ตร.ม. if explicitly shown), and a short Thai label. Ignore non-slab items.";

  const prompt =
    "Extract all precast concrete slabs from this image into the JSON schema. Ensure lengths are positive numbers in meters, counts are positive integers, and wireCount accurately matches the document.";

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      slabs: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            length: {
              type: Type.NUMBER,
              description: "ความยาวของแผ่นพื้นกี่เมตร (เมตร)",
            },
            count: {
              type: Type.INTEGER,
              description: "จำนวนแผ่นพื้นกี่แผ่น (แผ่น / ชิ้น)",
            },
            boardType: {
              type: Type.STRING,
              description: "ประเภทแผ่นพื้น: 'normal' (ธรรมดา) หรือ 'm.o.c' (มอก.)",
            },
            customPriceSqm: {
              type: Type.NUMBER,
              description: "ราคาเฉพาะตารางเมตรกรณีที่ระบุในภาพโดยตรง ถ้าไม่มีให้กำหนดเป็น 0",
            },
            wireCount: {
              type: Type.STRING,
              description: "จำนวนลวดสายอัดแรง ถ้ามีระบุ เช่น '4', '5', '6', '7', '8', '5_mm_5' หรือถ้าไม่มีใช้ 'auto'",
            },
            label: {
              type: Type.STRING,
              description: "บันทึกย่อหรือรายละเอียดสั้นๆ รวบรวมจากภาพ",
            },
          },
          required: ["length", "count"],
        },
      },
    },
    required: ["slabs"],
  };

  return generateJsonWithFallback([imagePart, { text: prompt }], systemInstruction, responseSchema);
}

/**
 * Parse slab descriptions from raw unstructured Thai text lines
 */
export async function parseSlabsFromText(text: string, normalPrice?: number, mocPrice?: number) {
  const systemInstruction =
    "You are an expert material estimator specializing in precast prestressed concrete slabs (แผ่นพื้นคอนกรีตสำเร็จรูปอัดแรง) in Thailand. " +
    "Parse each line into: length (meters), count (integer, default 1), boardType ('normal' or 'm.o.c'), " +
    "wireCount ('4', '5', '6', '7', '8', '5_mm_5' or 'auto'), customPriceSqm " +
    `('normal': ${normalPrice ?? 210}, 'm.o.c': ${mocPrice ?? 230}), and a short Thai label.`;

  const prompt =
    `Parse the following slab descriptions:\n${text}\n\n` +
    `Normal rate: ${normalPrice ?? 210} Baht/sqm, M.O.C. rate: ${mocPrice ?? 230} Baht/sqm.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      slabs: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            length: { type: Type.NUMBER },
            count: { type: Type.INTEGER },
            boardType: { type: Type.STRING },
            customPriceSqm: { type: Type.NUMBER },
            wireCount: { type: Type.STRING },
            label: { type: Type.STRING },
          },
          required: ["length", "count", "boardType", "customPriceSqm"],
        },
      },
    },
    required: ["slabs"],
  };

  return generateJsonWithFallback(prompt, systemInstruction, responseSchema);
}

/**
 * Universal Scanner: scans all concrete products (slabs, piles, hollow cores, fence posts, drainage pipes/basins, custom products)
 */
export async function scanUniversalFromImage(image: string, mimeType: string, customProducts: any[] = []) {
  const imagePart = {
    inlineData: {
      mimeType,
      data: image,
    },
  };

  let customProdInstruction = "";
  if (Array.isArray(customProducts) && customProducts.length > 0) {
    customProdInstruction =
      "\n6. Category 'custom': User-registered custom products:\n" +
      customProducts
        .map(
          (cp: any) =>
            `- Model ID: "${cp.id}", Name: "${cp.name}", Spec: "${cp.subLabel || ""}", Price: ${cp.price} ${cp.unit}, Category: "${cp.category}"`
        )
        .join("\n") +
      "\nIf an item matches any custom product, set category to 'custom' and model to its exact Model ID.\n";
  }

  const systemInstruction =
    "You are an expert Thai construction material estimator for Pongsakul Hardware. " +
    "Analyze the image and extract ALL precast concrete items into structured JSON.\n" +
    "Categories & Models:\n" +
    "1. 'slab': precast concrete slabs (แผ่นพื้นสำเร็จรูป). Model: 'normal' or 'm.o.c' (มอก.). Attributes: length (m), count (int), wireCount ('4','5','6','7','8','5_mm_5', or 'auto' — read exact wire count e.g. ลวด 4 เส้น -> '4', ลวด 5 เส้น -> '5', ลวด 5 มม. -> '5_mm_5').\n" +
    "2. 'pile': prestressed piles. Model: 'i15','i18','i22','i26','i30','i35','i40' (เสาเข็มไอ), 's18','s22','s26','s30','s35','s40' (เสาสี่เหลี่ยมตัน), 'hex' (หกเหลี่ยม), 'fence3','fence4' (เสารั้ว). tisStandard ('tis'|'no_tis'), connectionType ('single'|'joint'; if length >= 8m, MUST default to 'joint').\n" +
    "3. 'hollow_core': hollow core slabs (แผ่นกลวง). Model: 'hc'.\n" +
    "4. 'fence': fence posts. Model: 'fence3' or 'fence4'.\n" +
    "5. 'drainage': pipes ('pipe030','pipe040','pipe050','pipe060','pipe080','pipe100','pipe120','pipe150' with tisStandard 't2'|'t3'|'no_tis') and catch basins ('basin030'..'basin120'), length 1.0.\n" +
    customProdInstruction +
    "Ignore unrelated items (sand, cement, rebar, labor). Provide concise Thai labels.";

  const prompt =
    "Extract all concrete items from this image carefully. Ensure length (meters) and count (integer) are positive, wireCount matches the document exactly, and include customPrice if unit price is listed.";

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            model: { type: Type.STRING },
            length: { type: Type.NUMBER },
            count: { type: Type.INTEGER },
            wireCount: { type: Type.STRING },
            tisStandard: { type: Type.STRING },
            connectionType: { type: Type.STRING },
            customPrice: { type: Type.NUMBER },
            label: { type: Type.STRING },
          },
          required: ["category", "model", "length", "count"],
        },
      },
    },
    required: ["items"],
  };

  return generateJsonWithFallback([imagePart, { text: prompt }], systemInstruction, responseSchema);
}

/**
 * Universal Text Parser: parses multi-line descriptions of any concrete products
 */
export async function parseUniversalFromText(text: string, customProducts: any[] = []) {
  let customProdInstruction = "";
  if (Array.isArray(customProducts) && customProducts.length > 0) {
    customProdInstruction =
      "\n6. Category 'custom': User-registered custom products:\n" +
      customProducts
        .map(
          (cp: any) =>
            `- Model ID: "${cp.id}", Name: "${cp.name}", Spec: "${cp.subLabel || ""}", Price: ${cp.price} ${cp.unit}, Category: "${cp.category}"`
        )
        .join("\n") +
      "\nIf an item matches any custom product, set category to 'custom' and model to its exact Model ID.\n";
  }

  const systemInstruction =
    "You are an expert Thai construction material estimator for Pongsakul Hardware. " +
    "Parse multi-line Thai construction specifications into structured JSON:\n" +
    "1. 'slab': precast slabs (แผ่นพื้น). Model: 'normal' or 'm.o.c' (มอก.). wireCount ('4','5','6','7','8','5_mm_5', or 'auto').\n" +
    "2. 'pile': Model: 'i15'..'i40', 's18'..'s40', 'hex', 'fence3', 'fence4'. tisStandard ('tis'|'no_tis'), connectionType ('single'|'joint'; if length >= 8m, MUST default to 'joint').\n" +
    "3. 'hollow_core': Model 'hc'.\n" +
    "4. 'fence': Model 'fence3' or 'fence4'.\n" +
    "5. 'drainage': pipes ('pipe030'..'pipe150', tisStandard 't2'|'t3'|'no_tis') and catch basins ('basin030'..'basin120'), length 1.0.\n" +
    customProdInstruction +
    "Return category, model, length (m), count (int), wireCount, connectionType, tisStandard, optional customPrice, and Thai label.";

  const prompt = `Extract and organize all concrete items from:\n\n${text}`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            model: { type: Type.STRING },
            length: { type: Type.NUMBER },
            count: { type: Type.INTEGER },
            wireCount: { type: Type.STRING },
            tisStandard: { type: Type.STRING },
            connectionType: { type: Type.STRING },
            customPrice: { type: Type.NUMBER },
            label: { type: Type.STRING },
          },
          required: ["category", "model", "length", "count"],
        },
      },
    },
    required: ["items"],
  };

  return generateJsonWithFallback(prompt, systemInstruction, responseSchema);
}
