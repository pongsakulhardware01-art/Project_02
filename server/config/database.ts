import path from "path";
import fs from "fs";
import { initializeApp, FirebaseApp } from "firebase/app";
import { initializeFirestore, Firestore, setLogLevel, doc, getDoc, setDoc } from "firebase/firestore";

// Suppress Firestore idle stream timeout notices in console
try {
  setLogLevel("silent");
} catch (e) {
  // Ignore
}

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;

function shouldIgnoreLog(args: any[]): boolean {
  try {
    const message = args.map((arg) => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      return typeof arg === "object" ? JSON.stringify(arg) : String(arg);
    }).join(" ");

    return (
      message.includes("Disconnecting idle stream") ||
      message.includes("Timed out waiting for new targets") ||
      message.includes("Listen' stream") ||
      message.includes("@firebase/firestore") ||
      message.includes("GrpcConnection")
    );
  } catch (e) {
    return false;
  }
}

console.error = function (...args: any[]) {
  if (shouldIgnoreLog(args)) return;
  originalConsoleError.apply(console, args);
};

console.warn = function (...args: any[]) {
  if (shouldIgnoreLog(args)) return;
  originalConsoleWarn.apply(console, args);
};

console.log = function (...args: any[]) {
  if (shouldIgnoreLog(args)) return;
  originalConsoleLog.apply(console, args);
};

console.info = function (...args: any[]) {
  if (shouldIgnoreLog(args)) return;
  originalConsoleInfo.apply(console, args);
};

export interface FirebaseAppletConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let cachedFirebaseConfig: FirebaseAppletConfig | null = null;

const configPath = path.join(process.cwd(), "firebase-applet-config.json");

export function initFirebase(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, "utf-8");
      cachedFirebaseConfig = JSON.parse(raw);
      firebaseApp = initializeApp(cachedFirebaseConfig!);
      
      firestoreDb = initializeFirestore(
        firebaseApp,
        { experimentalForceLongPolling: true },
        cachedFirebaseConfig?.firestoreDatabaseId
      );

      console.log(
        "Firebase Firestore initialized successfully with database ID:",
        cachedFirebaseConfig?.firestoreDatabaseId || "(default)"
      );
    } catch (err) {
      console.error("Error initializing Firebase Firestore:", err);
    }
  } else {
    console.warn("firebase-applet-config.json not found. Backend will operate using disk/RAM persistence.");
  }

  return firestoreDb;
}

export function getFirestoreDb(): Firestore | null {
  if (!firestoreDb) {
    return initFirebase();
  }
  return firestoreDb;
}

export function getFirebaseConfig(): FirebaseAppletConfig | null {
  if (!cachedFirebaseConfig && fs.existsSync(configPath)) {
    try {
      cachedFirebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (e) {
      // Ignore
    }
  }
  return cachedFirebaseConfig;
}
