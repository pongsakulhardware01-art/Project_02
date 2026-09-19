import { GoogleGenAI, Type } from "@google/genai";

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("ไม่พบการตั้งค่า GEMINI_API_KEY ในระบบเซิร์ฟเวอร์ กรุณากำหนดค่าปุ่มคำสั่งหรือ Settings ก่อนใช้งาน");
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const MODELS_TO_TRY = ["gemini-3.1-flash-lite", "gemini-3.5-flash"];

/**
 * Scan prestressed concrete slabs from an image (handwritten note, table screenshot, or quotation)
 */
export async function scanSlabsFromImage(image: string, mimeType: string) {
  const ai = getGenAIClient();

  const imagePart = {
    inlineData: {
      mimeType,
      data: image,
    },
  };

  const systemInstruction =
    "You are an expert material estimator specializing in precast prestressed concrete slabs (แผ่นพื้นคอนกรีตสำเร็จรูปอัดแรง) for construction projects. " +
    "Your task is to analyze the image (which could be a handwritten list, a printed quotation page, table screenshot, or messages list) and extract a list of precast slabs. " +
    "Slabs normally have length in meters, count/quantity in sheet units. Standard width is 0.35m (35 centimeters). " +
    "Detect specifications carefully: length, count, optional custom price per square meter (ราคาต่อตารางเมตร บาท/ตร.ม. - ไม่รวมลวด ตั้งต้น) if explicitly listed, wireCount if mentioned, and a title label. " +
    "Only extract precast concrete slab (แผ่นพื้น หรือ แผ่นพื้นสำเร็จรูป) items, ignore other materials. Format output strictly according to the requested JSON response schema.";

  const prompt =
    "Please read this image carefully, extract all precast concrete slabs (แผ่นพื้นสำเร็จรูป) lists/rows you can find, and formulate them in the requested JSON structure. " +
    "Ensure all lengths are correctly parsed as decimal numbers in meters (e.g. 2.0, 3.5, etc.), counts as integers (number of slabs), " +
    "type as 'normal' or 'm.o.c' based on keywords, and any listed custom price/rate in Thai Baht.";

  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [imagePart, { text: prompt }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
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
                      description: "ราคาเฉพาะตารางเมตรกรณีที่ระบุในภาพโดยตรง ถ้าไม่มีให้กำหนดเป็น 0 หรือ null",
                    },
                    wireCount: {
                      type: Type.STRING,
                      description: "จำนวนลวดสายอัดแรง ถ้ามีระบุ เช่น '4', '5', '6', '7', '8' หรือถ้าไม่มีใช้ 'auto'",
                    },
                    label: {
                      type: Type.STRING,
                      description: "บันทึกย่อหรือรายละเอียดสั้นๆ รวบรวมจากภาพ เช่น 'แผ่นพื้น 2.50 ม. (สายไฟ 4 เส้น)'",
                    },
                  },
                  required: ["length", "count"],
                },
              },
            },
            required: ["slabs"],
          },
        },
      });

      if (response && response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err: any) {
      console.warn(`Error with model ${modelName}:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("ไม่มีข้อมูลตอบรับจาก Gemini API หลังจากพยายามทุกโมเดลแล้ว");
}

/**
 * Parse slab descriptions from raw unstructured Thai text lines
 */
export async function parseSlabsFromText(text: string, normalPrice?: number, mocPrice?: number) {
  const ai = getGenAIClient();

  const systemInstruction =
    "You are an expert material estimator specializing in precast prestressed concrete slabs (แผ่นพื้นคอนกรีตสำเร็จรูปอัดแรง) for construction projects in Thailand. " +
    "Your task is to analyze a list of concrete slab descriptions/specifications provided by the user (separated by lines). " +
    "Slabs have key attributes: length (เมตร), quantity/count (แผ่น/ชิ้น) and optionally wire counts (ลวด 4 เส้น, 5 เส้น, etc.). Standard width is 35cm (0.35m). " +
    "For each line, extract the length of the slab in meters as a decimal number, the quantity (count, defaults to 1 if not specified), slab type ('normal' or 'm.o.c'), " +
    "the wire count if mentioned ('4', '5', '6', '7', '8' or 'auto'), and a short friendly title label in Thai. " +
    "The user has also provided manual unit rates (ราคา/ตรม.): " +
    `- For 'normal' slabs: ${normalPrice ?? 210} Baht/sqm ` +
    `- For 'm.o.c' slabs: ${mocPrice ?? 230} Baht/sqm. ` +
    "Your output must be a JSON array of slabs. Each slab must contain boardType, length, count, and customPriceSqm populated with either the specified normal or moc price based on its type.";

  const prompt =
    `Please parse the following list of slabs text lines, group or list them, and map them to the correct attributes.\n` +
    `Text to parse:\n${text}\n\n` +
    `Standard rates to apply:\n` +
    `- Normal sheet: ${normalPrice ?? 210} Baht/sqm\n` +
    `- M.O.C. sheet: ${mocPrice ?? 230} Baht/sqm\n\n` +
    `Output strictly according to the requested JSON response schema. Ensure lengths are floating point numbers (e.g. 2.0, 3.5, etc.) and count is an integer.`;

  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              slabs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    length: {
                      type: Type.NUMBER,
                      description: "ความยาวของแผ่นพื้นกี่เมตร (เมตร) เช่น 2.00, 3.50",
                    },
                    count: {
                      type: Type.INTEGER,
                      description: "จำนวนแผ่นพื้นกี่แผ่น (ชิ้น / แผ่น), ปล่อยว่างหรือดีฟอลต์เป็น 1",
                    },
                    boardType: {
                      type: Type.STRING,
                      description: "ประเภทแผ่นพื้น: 'normal' (ธรรมดา) หรือ 'm.o.c' (มอก.)",
                    },
                    customPriceSqm: {
                      type: Type.NUMBER,
                      description: "ราคากลางต่อ ตร.ม. ที่ผู้ใช้ระบุ",
                    },
                    wireCount: {
                      type: Type.STRING,
                      description: "จำนวนลวดสายอัดแรง ถ้ามีในข้อความ เช่น '4', '5', '6', '7', '8' ดีฟอลต์คือ 'auto'",
                    },
                    label: {
                      type: Type.STRING,
                      description: "บันทึกข้อมูลดั้งเดิมสั้นๆ ของแถว",
                    },
                  },
                  required: ["length", "count", "boardType", "customPriceSqm"],
                },
              },
            },
            required: ["slabs"],
          },
        },
      });

      if (response && response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err: any) {
      console.warn(`Error with model ${modelName}:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("ไม่มีข้อมูลตอบรับจาก Gemini API หลังจากพยายามทุกโมเดลแล้ว");
}

/**
 * Universal Scanner: scans all concrete products (slabs, piles, hollow cores, fence posts, drainage pipes/basins, custom products)
 */
export async function scanUniversalFromImage(image: string, mimeType: string, customProducts: any[] = []) {
  const ai = getGenAIClient();

  const imagePart = {
    inlineData: {
      mimeType,
      data: image,
    },
  };

  let customProdInstruction = "";
  if (Array.isArray(customProducts) && customProducts.length > 0) {
    customProdInstruction =
      "\n6. Category 'custom': User-registered custom products in catalog (สินค้าที่ผู้ใช้เพิ่มเองในระบบ):\n" +
      customProducts
        .map(
          (cp: any) =>
            `- Model ID: "${cp.id}", ชื่อ: "${cp.name}", สเปก: "${cp.subLabel || ""}", ราคา: ${cp.price} ${cp.unit}, น้ำหนัก: ${cp.weight || 0} ${cp.weightUnit || ""}, หมวด: "${cp.category}"`
        )
        .join("\n") +
      "\nIf an item in the quotation/note matches any of these User-registered custom products (by name or specification), you MUST set category to 'custom' and model to that product's exact Model ID.\n";
  }

  const systemInstruction =
    "You are an expert material estimator specializing in precast concrete products (แผ่นพื้นสำเร็จรูป, เสาเข็ม, แผ่นกลวง, เสารั้ว, ท่อระบายน้ำ คสล., บ่อพัก คสล.) for construction projects. " +
    "Your task is to analyze the image (handwritten note, table screenshot, quotation bill) and extract ALL concrete items. " +
    "Support Categories & Models:\n" +
    "1. Category 'slab': precast concrete slabs. Model: 'normal' (แผ่นพื้นธรรมดา) or 'm.o.c' (แผ่นพื้น มอก.). Attributes: length (meters), count (quantity), wireCount ('4', '5', '6', '7', '8', '5_mm_5' or 'auto').\n" +
    "2. Category 'pile': prestressed concrete piles. Model: 'i15', 'i18', 'i22', 'i26', 'i30' (เสาเข็มไอ), 's18', 's22', 's26', 's30', 's35', 's40' (เสาสี่เหลี่ยมตัน), 'hex' (หกเหลี่ยม), 'fence3' (เสารั้ว 3 นิ้ว), 'fence4' (เสารั้ว 4 นิ้ว). Attributes: length (meters), count (quantity), tisStandard ('tis' or 'no_tis'), connectionType ('single' or 'joint' - only for i18 and i22).\n" +
    "3. Category 'hollow_core': precast hollow core slabs. Model: 'hc'. Attributes: length (meters), count (quantity), thickness (optional).\n" +
    "4. Category 'fence': fence posts. Model: 'fence3' (หน้า 3\" นิ้ว) or 'fence4' (หน้า 4\" นิ้ว). Attributes: length (meters), count (quantity).\n" +
    "5. Category 'drainage': concrete pipes (ท่อระบายน้ำ คสล.) and catch basins (บ่อพัก คสล.). \n" +
    "   - Pipes: Model MUST be 'pipe030' (30cm / 0.30m), 'pipe040' (40cm), 'pipe050' (50cm), 'pipe060' (60cm), 'pipe080' (80cm), 'pipe100' (100cm), 'pipe120' (120cm), 'pipe150' (150cm). Set tisStandard to 't2' (for มอก.ชั้น 2), 't3' (for มอก.ชั้น 3), or 'no_tis' (ปกติ/คสล.).\n" +
    "   - Catch basins: Model MUST be 'basin030' (for pipe 30cm), 'basin040', 'basin050', 'basin060', 'basin080', 'basin100', 'basin120'. Length of drainage is 1.0.\n" +
    customProdInstruction +
    "Ignore other construction materials (sand, cement bricks, steel rebars, labor fees) and only extract precast concrete elements manufactured by Pongsakul.";

  const prompt =
    "Please read this image carefully, extract all concrete slabs, piles, hollow cores, fence posts, drainage pipes/basins, and custom products lists/rows you can find, and formulate them in the requested JSON structure. " +
    "Ensure lengths and counts are always positive numbers, handle unit rates (customPrice) in Baht if listed directly, and provide Thai description labels.";

  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [imagePart, { text: prompt }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
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
          },
        },
      });

      if (response && response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("ไม่มีข้อมูลสรุปตอบสนองจากการประมวลผลรูปภาพระบบคลาวด์");
}

/**
 * Universal Text Parser: parses multi-line descriptions of any concrete products
 */
export async function parseUniversalFromText(text: string, customProducts: any[] = []) {
  const ai = getGenAIClient();

  let customProdInstruction = "";
  if (Array.isArray(customProducts) && customProducts.length > 0) {
    customProdInstruction =
      "\n6. Category 'custom': User-registered custom products in catalog (สินค้าที่ผู้ใช้เพิ่มเองในระบบ):\n" +
      customProducts
        .map(
          (cp: any) =>
            `- Model ID: "${cp.id}", ชื่อ: "${cp.name}", สเปก: "${cp.subLabel || ""}", ราคา: ${cp.price} ${cp.unit}, น้ำหนัก: ${cp.weight || 0} ${cp.weightUnit || ""}, หมวด: "${cp.category}"`
        )
        .join("\n") +
      "\nIf an item in the text matches any of these User-registered custom products (by name or specification), you MUST set category to 'custom' and model to that product's exact Model ID.\n";
  }

  const systemInstruction =
    "You are an expert material estimator specializing in construction products of Pongsakul Hardware (Thailand). " +
    "Your task is to parse unstructured, multi-line construction material specifications in Thai, extracting ALL matching concrete products into a structured JSON database.\n" +
    "Key Classes to Extract:\n" +
    "1. Category 'slab': precast concrete slabs (แผ่นพื้นสำเร็จ, แผ่นพื้นคอนกรีต). Model: 'normal' or 'm.o.c' (มอก.). Detect wireCount ('4', '5', '6', '7', '8', '5_mm_5' or 'auto'). Width is always 35cm (0.35m).\n" +
    "2. Category 'pile': precast concrete piles. Model could be I-shape: 'i15', 'i18', 'i22', 'i26', 'i30' OR Solid Square: 's18', 's22', 's26', 's30', 's35', 's40' OR 'hex' (เสาเข็มหกเหลี่ยม) OR fence posts ('fence3', 'fence4'). Detect tisStandard ('tis' / 'no_tis') and connectionType ('single' / 'joint' for i18,i22 if mentioned).\n" +
    "3. Category 'hollow_core': hollow core slabs (แผ่นกลวง). Model: 'hc'.\n" +
    "4. Category 'fence': fence post. Model: 'fence3' (3 นิ้ว) or 'fence4' (4 นิ้ว).\n" +
    "5. Category 'drainage': concrete drainage pipes (ท่อระบายน้ำ คสล., ท่อระบายน้ำ มอก.) and catch basins (บ่อพัก คสล.).\n" +
    "   - Pipes: Model MUST be 'pipe030', 'pipe040', 'pipe050', 'pipe060', 'pipe080', 'pipe100', 'pipe120', 'pipe150'. Set tisStandard to 't2', 't3', or 'no_tis'.\n" +
    "   - Catch basins: Model MUST be 'basin030'..'basin120'. Length of drainage defaults to 1.0.\n" +
    customProdInstruction +
    "Extract attributes strictly: category, model, length (in meters as numeric), count (quantity), wireCount, connectionType, tisStandard, optional customPrice/rate if listed directly, and label in Thai.";

  const prompt =
    `Extract and organize all listed concrete items from this description:\n\n` +
    `Text:\n${text}\n\n` +
    `Ensure numbers (length, check counts) are carefully parsed. Output strictly in the requested JSON format.`;

  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
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
          },
        },
      });

      if (response && response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("ไม่มีข้อมูลสเปกตอบสนองจากการระบุของระบบ AI");
}
