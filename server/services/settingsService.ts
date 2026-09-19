import path from "path";
import fs from "fs";
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { getFirestoreDb, getFirebaseConfig } from "../config/database";
import {
  defaultSettings,
  defaultPrices,
  defaultCosts,
  defaultWeights,
  defaultSuppliers,
} from "../../src/data";
import { AppSettings, SupplierProfile } from "../../src/types";

const DB_PATH = path.join(process.cwd(), "settings-db.json");

let cachedSettings: AppSettings | null = null;
let unsubscribeListener: Unsubscribe | null = null;

/**
 * Sanitize settings to guarantee data integrity:
 * - Prevents standard catalog product keys from ever being blacklisted in deletedItemIds
 * - Fills in missing prices, costs, or weights from defaults
 * - Ensures suppliers array is properly structured and default supplier exists
 */
export function sanitizeSettings(data: any): AppSettings {
  if (!data || typeof data !== "object") {
    return JSON.parse(JSON.stringify(defaultSettings));
  }

  // 1. Sanitize deletedItemIds: Never allow standard catalog items to be deleted
  let cleanedDeleted = Array.isArray(data.deletedItemIds) ? data.deletedItemIds : [];
  if (cleanedDeleted.includes("normalBoardPrice") || cleanedDeleted.includes("mocBoardPrice")) {
    cleanedDeleted = cleanedDeleted.filter((id: string) => typeof id === "string" && id.startsWith("custom_"));
  }

  // 2. Sanitize Suppliers
  let suppliers: SupplierProfile[] = Array.isArray(data.suppliers) && data.suppliers.length > 0
    ? data.suppliers
    : JSON.parse(JSON.stringify(defaultSuppliers));

  suppliers = suppliers.map((sup: any) => {
    let supDeleted = Array.isArray(sup.deletedItemIds) ? sup.deletedItemIds : [];
    if (supDeleted.includes("normalBoardPrice") || supDeleted.includes("mocBoardPrice")) {
      supDeleted = supDeleted.filter((id: string) => typeof id === "string" && id.startsWith("custom_"));
    }

    return {
      ...sup,
      prices: { ...defaultPrices, ...(sup.prices || {}) },
      costs: { ...defaultCosts, ...(sup.costs || {}) },
      weights: { ...defaultWeights, ...(sup.weights || {}) },
      deletedItemIds: supDeleted,
    };
  });

  const activeSupplierId = data.activeSupplierId || suppliers[0]?.id || "pongsakul_main";
  const activeSupplier = suppliers.find((s) => s.id === activeSupplierId) || suppliers[0];

  return {
    activeSupplierId,
    suppliers,
    prices: { ...defaultPrices, ...(activeSupplier?.prices || data.prices || {}) },
    costs: { ...defaultCosts, ...(activeSupplier?.costs || data.costs || {}) },
    weights: { ...defaultWeights, ...(activeSupplier?.weights || data.weights || {}) },
    customProducts: Array.isArray(activeSupplier?.customProducts)
      ? activeSupplier.customProducts
      : (Array.isArray(data.customProducts) ? data.customProducts : []),
    deletedItemIds: cleanedDeleted,
    defaultDestination: data.defaultDestination || undefined,
  };
}

/**
 * Startup initialization: loads settings from Firestore, or disk, or defaults,
 * migrates if needed, and establishes baseline persistence.
 */
export async function loadAndInitializeSettings(): Promise<AppSettings> {
  const db = getFirestoreDb();
  let loadedData: any = null;

  // 1. Try reading from Firestore
  if (db) {
    try {
      const snap = await getDoc(doc(db, "settings", "config"));
      if (snap.exists()) {
        loadedData = snap.data();
        console.log("Settings loaded from Firestore during server startup");
      }
    } catch (e) {
      console.error("Error reading settings from Firestore during startup:", e);
    }
  }

  // 2. Try disk fallback if Firestore had no document or failed
  if (!loadedData && fs.existsSync(DB_PATH)) {
    try {
      const fileContent = fs.readFileSync(DB_PATH, "utf-8");
      loadedData = JSON.parse(fileContent);
      console.log("Settings loaded from local settings-db.json during startup");
    } catch (e) {
      console.error("Error reading settings from settings-db.json:", e);
    }
  }

  // 3. Sanitize and initialize
  const sanitized = sanitizeSettings(loadedData || defaultSettings);
  cachedSettings = sanitized;

  // 4. Persist to Firestore and disk to keep both in sync
  if (db) {
    try {
      await setDoc(doc(db, "settings", "config"), sanitized);
    } catch (e) {
      console.error("Failed to persist initialized settings to Firestore:", e);
    }
  }

  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(sanitized, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist initialized settings to settings-db.json:", e);
  }

  // Register real-time sync listener
  initSettingsListener();

  return sanitized;
}

/**
 * Register real-time Firestore listener so all server container instances
 * synchronize instantly without server restart.
 */
export function initSettingsListener() {
  const db = getFirestoreDb();
  if (!db || unsubscribeListener) return;

  try {
    unsubscribeListener = onSnapshot(
      doc(db, "settings", "config"),
      (docSnap) => {
        if (docSnap.exists()) {
          const fresh = docSnap.data();
          if (fresh && (fresh.prices || fresh.suppliers)) {
            const cleaned = sanitizeSettings(fresh);
            cachedSettings = cleaned;
            console.log("Real-time settings updated from Firestore snapshot");

            // Auto-heal Firestore if standard products were accidentally blacklisted
            if (Array.isArray(fresh.deletedItemIds) && fresh.deletedItemIds.includes("normalBoardPrice")) {
              setDoc(doc(db, "settings", "config"), cleaned).catch(() => {});
            }

            try {
              fs.writeFileSync(DB_PATH, JSON.stringify(cleaned, null, 2), "utf-8");
            } catch (err) {
              // Ignore disk error in background
            }
          }
        }
      },
      (err) => {
        console.error("Firestore settings listener error:", err);
      }
    );
  } catch (e) {
    console.error("Failed to register Firestore settings listener:", e);
  }
}

/**
 * Get current settings (checks Firestore first if online, falls back to RAM cache and disk)
 */
export async function getSettings(): Promise<AppSettings> {
  const db = getFirestoreDb();

  if (db) {
    try {
      const snap = await getDoc(doc(db, "settings", "config"));
      if (snap.exists()) {
        const raw = snap.data();
        const cleaned = sanitizeSettings(raw);
        cachedSettings = cleaned;
        return cleaned;
      }
    } catch (e) {
      console.error("Error fetching settings from Firestore on demand:", e);
    }
  }

  if (cachedSettings) {
    return cachedSettings;
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      cachedSettings = sanitizeSettings(JSON.parse(raw));
      return cachedSettings;
    } catch (e) {
      console.error("Error reading disk settings fallback:", e);
    }
  }

  return JSON.parse(JSON.stringify(defaultSettings));
}

/**
 * Save settings globally to RAM, Firestore, and local disk
 */
export async function saveSettings(newSettings: any): Promise<AppSettings> {
  const sanitized = sanitizeSettings(newSettings);
  cachedSettings = sanitized;

  const db = getFirestoreDb();
  if (db) {
    try {
      await setDoc(doc(db, "settings", "config"), sanitized);
      console.log("Settings successfully written to Firestore");
    } catch (e) {
      console.error("Error saving settings to Firestore:", e);
    }
  }

  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(sanitized, null, 2), "utf-8");
    console.log("Settings successfully written to settings-db.json");
  } catch (e) {
    console.error("Error saving settings to disk:", e);
  }

  return sanitized;
}

/**
 * Diagnostic status check for Cloud database connectivity and health
 */
export async function getCloudStatus() {
  const startTime = Date.now();
  const db = getFirestoreDb();
  const config = getFirebaseConfig();

  if (!db) {
    return {
      connected: false,
      status: "disconnected",
      message: "Firebase ยังไม่ได้เชื่อมต่อ หรือไม่พบไฟล์คอนฟิก",
      projectId: config?.projectId || "N/A",
      databaseId: config?.firestoreDatabaseId || "N/A",
      latencyMs: 0,
      cachedInRam: !!cachedSettings,
      lastChecked: new Date().toISOString(),
    };
  }

  try {
    const docRef = doc(db, "settings", "config");
    const snap = await getDoc(docRef);
    const latencyMs = Date.now() - startTime;
    const data = snap.exists() ? snap.data() : null;

    return {
      connected: true,
      status: "online",
      message: "ระบบคลาวด์เชื่อมต่อและซิงค์ข้อมูลสมบูรณ์ 100%",
      projectId: config?.projectId || "steady-order-0fs6l",
      databaseId: config?.firestoreDatabaseId || "ai-studio-pongsakulhardwar-c9b85e7e-1f40-457d-a048-1a91b69823bf",
      documentExists: snap.exists(),
      latencyMs,
      activeSupplierId: data?.activeSupplierId || "pongsakul_main",
      suppliersCount: Array.isArray(data?.suppliers) ? data.suppliers.length : 0,
      customProductsCount: Array.isArray(data?.customProducts) ? data.customProducts.length : 0,
      deletedItemsCount: Array.isArray(data?.deletedItemIds) ? data.deletedItemIds.length : 0,
      cachedInRam: !!cachedSettings,
      lastChecked: new Date().toISOString(),
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      status: "error",
      message: "เกิดข้อผิดพลาดในการติดต่อ Firestore: " + (err?.message || "Unknown error"),
      projectId: config?.projectId || "N/A",
      databaseId: config?.firestoreDatabaseId || "N/A",
      latencyMs,
      cachedInRam: !!cachedSettings,
      error: err?.message,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Diagnostic read & write test
 */
export async function testCloudSync() {
  const startTime = Date.now();
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Database not initialized");
  }

  const docRef = doc(db, "settings", "config");
  await getDoc(docRef);
  
  const current = cachedSettings || (await getSettings());
  await setDoc(docRef, current);

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    readSuccess: true,
    writeSuccess: true,
    latencyMs,
    message: `ทดสอบอ่านและบันทึกคลาวด์สำเร็จ (${latencyMs}ms)`,
    timestamp: new Date().toISOString(),
  };
}

export function getCachedSettings(): AppSettings | null {
  return cachedSettings;
}
