import { useState, useEffect } from "react";
import { AppSettings, WeightItem } from "./types";
import { defaultSettings, defaultSuppliers, APP_VERSION, weightOptions, truckCapacities } from "./data";
import { getDynamicWeightOptions } from "./utils/productCatalog";
import SlabCalculator from "./components/SlabCalculator";
import PileCalculator from "./components/PileCalculator";
import HollowCoreCalculator from "./components/HollowCoreCalculator";
import DrainageCalculator from "./components/DrainageCalculator";
import WeightCalculator from "./components/WeightCalculator";
import SettingsPanel from "./components/SettingsPanel";
import UniversalBatchCalculator from "./components/UniversalBatchCalculator";
import { CloudSystemStatusCard } from "./components/CloudSystemStatusCard";
import { getTruckAllocationOptions } from "./utils";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  Scale,
  Settings,
  Hammer,
  Clock,
  ChevronRight,
  User,
  LayoutGrid,
  Zap,
  Package,
  Layers,
  Sparkles,
  Droplets,
  Menu,
  X,
  Database,
  Cloud,
  Truck,
  TrendingUp,
  FileText,
  Factory,
  Building2,
  Check,
  ChevronDown,
  MapPin,
  ArrowRight
} from "lucide-react";

const MenuCard = ({
  onClick,
  icon: Icon,
  title,
  description,
  badge,
  tagText,
  accentColor = "red",
}: {
  onClick: () => void;
  icon: any;
  title: string;
  description: string;
  badge?: string;
  tagText?: string;
  accentColor?: "red" | "amber" | "emerald" | "indigo";
}) => {
  const colorMap = {
    red: {
      bg: "bg-red-50 text-[#C62828] group-hover:bg-[#C62828] group-hover:text-white",
      border: "hover:border-[#C62828]/50",
      pill: "bg-red-100/80 text-red-800",
    },
    amber: {
      bg: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
      border: "hover:border-amber-400/50",
      pill: "bg-amber-100/80 text-amber-800",
    },
    emerald: {
      bg: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
      border: "hover:border-emerald-400/50",
      pill: "bg-emerald-100/80 text-emerald-800",
    },
    indigo: {
      bg: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
      border: "hover:border-indigo-400/50",
      pill: "bg-indigo-100/80 text-indigo-800",
    },
  }[accentColor];

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`bg-white text-left p-6 rounded-3xl border border-neutral-200/90 shadow-sm hover:shadow-xl group transition-all duration-300 flex flex-col justify-between min-h-[230px] relative overflow-hidden cursor-pointer ${colorMap.border}`}
    >
      <div className="flex items-start justify-between w-full relative z-10">
        <div className={`p-3.5 rounded-2xl shadow-sm transition-all duration-300 ${colorMap.bg}`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center gap-1.5">
          {tagText && (
            <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
              {tagText}
            </span>
          )}
          {badge && (
            <span className="bg-amber-500 text-neutral-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 relative z-10 mt-4">
        <h3 className="font-extrabold text-neutral-800 text-lg group-hover:text-[#C62828] transition-colors duration-200 flex items-center justify-between">
          <span>{title}</span>
          <ChevronRight size={18} className="text-neutral-300 group-hover:text-[#C62828] transform group-hover:translate-x-1 transition-all duration-300" />
        </h3>
        <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">{description}</p>
      </div>
    </motion.button>
  );
};

export default function App() {
  // Navigation State
  // "menu", "price", "scan", "weight", "settings"
  const [currentScreen, setCurrentScreen] = useState<string>("menu");
  // Sub-tab inside Price category
  // "slab", "pile", "hollowCore", "drainage"
  const [priceSubTab, setPriceSubTab] = useState<string>("slab");
  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  // Supplier quick switcher popover state
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState<boolean>(false);
  // Cloud diagnostic modal state
  const [cloudModalOpen, setCloudModalOpen] = useState<boolean>(false);

  // Load configuration from local storage, baked in state, or fallback to defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const storedVer = localStorage.getItem("pongsakulVersion");
    if (storedVer !== APP_VERSION) {
      localStorage.removeItem("pongsakulSettings");
      localStorage.setItem("pongsakulVersion", APP_VERSION);
    }

    const baked = (window as any).BAKED_SETTINGS;
    if (baked && typeof baked === "object") {
      return {
        activeSupplierId: baked.activeSupplierId || defaultSettings.activeSupplierId,
        suppliers: (baked.suppliers && baked.suppliers.length > 0) ? baked.suppliers : defaultSuppliers,
        prices: { ...defaultSettings.prices, ...baked.prices },
        costs: { ...defaultSettings.costs, ...baked.costs },
        weights: { ...defaultSettings.weights, ...baked.weights },
        customProducts: Array.isArray(baked.customProducts) ? baked.customProducts : (defaultSettings.customProducts || []),
        deletedItemIds: Array.isArray(baked.deletedItemIds) ? baked.deletedItemIds : (defaultSettings.deletedItemIds || []),
      };
    }

    const saved = localStorage.getItem("pongsakulSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let cleanedDeleted = Array.isArray(parsed.deletedItemIds) ? parsed.deletedItemIds : (defaultSettings.deletedItemIds || []);
        if (cleanedDeleted.includes("normalBoardPrice")) {
          cleanedDeleted = cleanedDeleted.filter((id: string) => id.startsWith("custom_"));
        }
        return {
          activeSupplierId: parsed.activeSupplierId || defaultSettings.activeSupplierId,
          suppliers: (parsed.suppliers && parsed.suppliers.length > 0) ? parsed.suppliers : defaultSuppliers,
          prices: { ...defaultSettings.prices, ...parsed.prices },
          costs: { ...defaultSettings.costs, ...parsed.costs },
          weights: { ...defaultSettings.weights, ...parsed.weights },
          customProducts: Array.isArray(parsed.customProducts) ? parsed.customProducts : (defaultSettings.customProducts || []),
          deletedItemIds: cleanedDeleted,
        };
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
    return defaultSettings;
  });

  // Fetch from Express server on mount + start real-time polling every 3 seconds
  useEffect(() => {
    const fetchSharedSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const cloudSettings = await res.json();
          if (cloudSettings && typeof cloudSettings === "object") {
            setSettings((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(cloudSettings)) {
                localStorage.setItem("pongsakulSettings", JSON.stringify(cloudSettings));
                return cloudSettings;
              }
              return prev;
            });
          }
        }
      } catch (err) {
        // Fallback silently if offline or backend is initializing
      }
    };

    fetchSharedSettings();
    const syncInterval = setInterval(fetchSharedSettings, 3000);
    return () => clearInterval(syncInterval);
  }, []);

  // Global list of items inside Weight Calculator to preserve stats when switching screens
  const [weightItems, setWeightItems] = useState<WeightItem[]>([]);

  // Calculate live cumulative total weight
  const getWeightPerMeter = (typeValue: string): number => {
    const dynamicOpts = getDynamicWeightOptions(settings);
    const dyn = dynamicOpts.find((o) => o.value === typeValue);
    if (dyn) return dyn.weight;
    const opt = weightOptions.find((o) => o.value === typeValue);
    if (!opt) return 0;
    return settings.weights[opt.weightKey] || 0;
  };

  const calculateItemWeight = (item: WeightItem): number => {
    const rawWPerMeter = item.unitWeight !== undefined ? item.unitWeight : getWeightPerMeter(item.type);
    const wPerMeter = rawWPerMeter === "" ? 0 : rawWPerMeter;
    const dynamicOpts = getDynamicWeightOptions(settings);
    const dyn = dynamicOpts.find((o) => o.value === item.type);
    const isPerPieceItem = dyn ? dyn.isPerPiece : (item.type.startsWith("pipe") || item.type.startsWith("basin"));
    const len = isPerPieceItem ? 1.0 : (item.length === "" ? 0 : item.length);
    const cnt = item.count === "" ? 0 : item.count;
    return wPerMeter * len * cnt;
  };

  const totalWeightKg = weightItems.reduce((sum, item) => sum + calculateItemWeight(item), 0);
  const totalItemCount = weightItems.reduce((sum, item) => sum + (item.count === "" ? 0 : item.count), 0);

  // Recommended truck fleet allocation based on weight
  const getRecommendedTruckText = () => {
    if (totalWeightKg === 0) return "";
    
    // If it fits in a single vehicle, find the best fit
    const fit = truckCapacities.find((truck) => truck.capacityKg >= totalWeightKg);
    if (fit) {
      return fit.name;
    }
    
    // Otherwise, find the best mix option (Optimal Large-First Mix)
    const options = getTruckAllocationOptions(totalWeightKg);
    const optimal = options.find((opt) => opt.type === "optimal_large");
    if (optimal && optimal.trucks.length > 0) {
      return optimal.trucks.map((t) => {
        const shortName = t.name.replace("รถบรรทุก ", "").replace("รถ", "");
        return `${shortName} ${t.count} คัน`;
      }).join(" + ");
    }
    
    return "รถพ่วงพิกัดเสริม (น้ำหนักเกิน)";
  };

  const recommendedTruckText = getRecommendedTruckText();

  // Active supplier detection
  const suppliersList = settings.suppliers && settings.suppliers.length > 0 ? settings.suppliers : defaultSuppliers;
  const activeSupplier = suppliersList.find((s) => s.id === (settings.activeSupplierId || "pongsakul_main")) || suppliersList[0];

  const handleSelectSupplier = async (supplierId: string) => {
    const target = suppliersList.find((s) => s.id === supplierId);
    if (!target) return;

    let targetDeleted = Array.isArray(target.deletedItemIds) ? target.deletedItemIds : [];
    if (targetDeleted.includes("normalBoardPrice")) {
      targetDeleted = targetDeleted.filter((id) => id.startsWith("custom_"));
    }

    const updatedSettings: AppSettings = {
      ...settings,
      activeSupplierId: supplierId,
      prices: target.prices,
      costs: target.costs || settings.costs,
      weights: target.weights,
      customProducts: target.customProducts || [],
      deletedItemIds: targetDeleted,
      suppliers: suppliersList,
    };

    setSettings(updatedSettings);
    localStorage.setItem("pongsakulSettings", JSON.stringify(updatedSettings));

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
    } catch (e) {
      // Offline fallback
    }
  };

  // Current Thai Date Formatted
  const thaiDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sidebarItems = [
    { id: "menu", label: "หน้าหลัก / สรุปแดชบอร์ด", icon: LayoutGrid },
    { id: "price", label: "คำนวณราคาเดี่ยว", icon: Calculator },
    { id: "scan", label: "คำนวณหลายรายการ AI", icon: Sparkles, badge: "ยอดนิยม" },
    { id: "weight", label: "คำนวณระวางขนส่ง", icon: Scale, countBadge: weightItems.length > 0 ? `${weightItems.length}` : undefined },
    { id: "settings", label: "ราคากลาง & แค็ตตาล็อก", icon: Settings },
  ];

  const handleScreenChange = (screenId: string) => {
    setCurrentScreen(screenId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50/70 text-neutral-800 flex flex-col lg:flex-row font-sans selection:bg-red-500 selection:text-white">
      
      {/* 1. LEFT SIDEBAR (Desktop - Fixed width: 280px) */}
      <aside className="hidden lg:flex flex-col w-[290px] bg-neutral-900 text-white shrink-0 shadow-2xl relative border-r border-neutral-800">
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-800 bg-[#C62828] bg-gradient-to-r from-[#C62828] to-[#B71C1C]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Hammer className="text-amber-300" size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight font-display leading-tight">
                PONGSAKUL
              </h1>
              <p className="text-[10px] font-medium text-red-100 tracking-wider uppercase opacity-90">
                HARDWARE CO., LTD.
              </p>
            </div>
          </div>
        </div>

        {/* Real-time sync status banner (Clickable to open Cloud Diagnostics) */}
        <button
          type="button"
          onClick={() => setCloudModalOpen(true)}
          className="w-full px-6 py-3 bg-neutral-950/40 hover:bg-neutral-800/60 transition-colors border-b border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 cursor-pointer text-left group"
          title="คลิกเพื่อตรวจสอบสถานะคลาวด์และฐานข้อมูล"
        >
          <span className="flex items-center gap-1.5 font-medium group-hover:text-emerald-400 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>เชื่อมต่อคลาวด์เรียลไทม์</span>
          </span>
          <span className="font-mono bg-neutral-800 group-hover:bg-neutral-700 px-1.5 py-0.5 rounded text-[10px] text-neutral-300">
            {APP_VERSION}
          </span>
        </button>

        {/* Navigation Sidebar List */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleScreenChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-250 ${
                  isActive
                    ? "bg-[#C62828] text-white shadow-md shadow-red-900/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-neutral-400 group-hover:text-white"} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-extrabold bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
                {item.countBadge && (
                  <span className="text-[10px] font-black bg-white/20 text-white w-5 h-5 rounded-full flex items-center justify-center">
                    {item.countBadge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* DYNAMIC SIDEBAR WEIGHT SUMMARY WIDGET */}
        {totalWeightKg > 0 && (
          <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-b from-neutral-800/80 to-neutral-950/90 border border-neutral-700/60 space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                <Truck size={16} />
              </div>
              <span className="text-xs font-bold text-neutral-200">ระวางขนส่งกองสะสม</span>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black font-mono text-white tracking-tight">
                {(totalWeightKg / 1000).toFixed(2)} <span className="text-xs font-bold text-neutral-400">ตัน</span>
              </p>
              <p className="text-[11px] text-neutral-400 font-mono">
                {totalWeightKg.toLocaleString()} กิโลกรัม
              </p>
            </div>
            {recommendedTruckText && (
              <div className="pt-2 border-t border-neutral-800 space-y-1">
                <div className="text-[11px] text-neutral-400 flex justify-between items-start gap-1">
                  <span className="shrink-0 text-neutral-400">รถจัดส่งที่แนะนำ:</span>
                  <span className="font-extrabold text-[#F59E0B] text-right leading-tight">
                    {recommendedTruckText}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => handleScreenChange("weight")}
              className="w-full text-center py-1.5 bg-neutral-800 hover:bg-[#C62828] text-white rounded-lg text-[11px] font-bold transition duration-200"
            >
              ดูสเปกเต็มยานพาหนะ
            </button>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-800 text-[11px] text-neutral-500 space-y-1">
          <p className="font-semibold text-neutral-400">บจก. พงษ์สกุลฮาร์ดแวร์</p>
          <p className="font-light">ระบบคำนวณราคากลางอัจฉริยะ {APP_VERSION}</p>
        </div>
      </aside>

      {/* 2. MOBILE TOP HEADER */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#C62828] bg-gradient-to-r from-[#C62828] via-[#B71C1C] to-[#8E0000] text-white shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Hammer size={18} className="text-amber-300" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase leading-none">PONGSAKUL</h1>
              <p className="text-[10px] font-medium text-red-100 leading-none mt-1">คอนกรีต & การขนส่ง</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Supplier Switcher Chip on Mobile Header */}
            <button
              onClick={() => setSupplierDropdownOpen(!supplierDropdownOpen)}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-white/20 transition cursor-pointer"
            >
              <Factory size={12} className="text-amber-300" />
              <span className="truncate max-w-[85px]">{activeSupplier.name}</span>
              <ChevronDown size={11} className={`transition-transform duration-200 ${supplierDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Sync Pulse Dot (Clickable) */}
            <button
              type="button"
              onClick={() => setCloudModalOpen(true)}
              className="p-1 rounded-full hover:bg-white/10 active:scale-95 transition cursor-pointer"
              title="ตรวจสอบสถานะคลาวด์"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Supplier Quick Switcher Dropdown */}
        <AnimatePresence>
          {supplierDropdownOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-neutral-900 border-t border-neutral-800 p-3 space-y-2 overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Factory size={13} className="text-amber-400" />
                  เลือกโรงงานซัพพลายเออร์ที่ใช้งาน
                </span>
                <button
                  onClick={() => setSupplierDropdownOpen(false)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {(settings.suppliers || []).map((s) => {
                  const isCur = s.id === settings.activeSupplierId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        handleSelectSupplier(s.id);
                        setSupplierDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                        isCur
                          ? "bg-[#C62828] text-white font-bold"
                          : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold truncate">{s.name}</span>
                          {s.isDefault && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                              หลัก
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate">{s.location || s.code}</p>
                      </div>
                      {isCur && <Check size={14} className="text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  setSupplierDropdownOpen(false);
                  handleScreenChange("settings");
                }}
                className="w-full text-center py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>จัดการราคากลางโรงงานทั้งหมด</span>
                <ArrowRight size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Status bar */}
        <header className="hidden lg:flex items-center justify-between bg-white border-b border-neutral-200/80 px-8 py-4 shrink-0 relative z-30">
          <div>
            <h2 className="text-xl font-bold font-display text-neutral-800">
              {currentScreen === "menu" && "แผงสรุปข้อมูลแดชบอร์ด"}
              {currentScreen === "price" && "คำนวณราคาเฉพาะรายการเดี่ยว"}
              {currentScreen === "scan" && "ระบบสแกนเอกสารและประมาณราคารวม AI"}
              {currentScreen === "weight" && "การคำนวณพิกัดและจำลองการจัดเรียงน้ำหนัก"}
              {currentScreen === "settings" && "แผงตารางราคากลางส่วนกลางและแค็ตตาล็อก"}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
              <span className="font-medium text-neutral-700">บริษัท พงษ์สกุลฮาร์ดแวร์ จำกัด</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#C62828] font-medium">
                <Clock size={12} /> {thaiDate}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Active Supplier Quick Dropdown Trigger in Desktop Header */}
            <div className="relative">
              <button
                onClick={() => setSupplierDropdownOpen(!supplierDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/90 active:scale-98 text-neutral-700 rounded-xl border border-neutral-200 transition cursor-pointer text-xs"
                title="คลิกเพื่อสลับซัพพลายเออร์ทันที"
              >
                <Factory size={13} className="text-[#C62828]" />
                <span className="font-semibold text-neutral-600">ซัพพลายเออร์:</span>
                <span className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded-lg border border-neutral-200 shadow-2xs">
                  {activeSupplier.name}
                </span>
                <ChevronDown size={12} className={`text-neutral-500 transition-transform duration-200 ${supplierDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Desktop Popover Menu */}
              <AnimatePresence>
                {supplierDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setSupplierDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-neutral-200 shadow-2xl p-3 space-y-2 z-50 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                        <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                          <Factory size={13} className="text-[#C62828]" />
                          เลือกโรงงานซัพพลายเออร์
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {(settings.suppliers || []).length} แห่ง
                        </span>
                      </div>
                      <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                        {(settings.suppliers || []).map((s) => {
                          const isCur = s.id === settings.activeSupplierId;
                          return (
                            <button
                              key={s.id}
                              onClick={() => {
                                handleSelectSupplier(s.id);
                                setSupplierDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                                isCur
                                  ? "bg-red-50 text-[#C62828] font-bold border border-red-200"
                                  : "hover:bg-neutral-50 text-neutral-700"
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate">{s.name}</span>
                                  {s.isDefault && (
                                    <span className="text-[9px] bg-neutral-200 text-neutral-700 px-1.5 py-0.2 rounded">
                                      หลัก
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-neutral-400 truncate">{s.location || s.code}</p>
                              </div>
                              {isCur && <Check size={14} className="text-[#C62828] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => {
                          setSupplierDropdownOpen(false);
                          handleScreenChange("settings");
                        }}
                        className="w-full text-center py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold transition flex items-center justify-center gap-1 text-[11px]"
                      >
                        <span>เปิดหน้าตั้งค่าโรงงานและแค็ตตาล็อก</span>
                        <ArrowRight size={12} />
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              เชื่อมคลาวด์เรียลไทม์
            </span>
            <div className="h-6 w-px bg-neutral-200" />
            <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <User size={15} className="text-[#C62828]" />
              แอดมินพงษ์สกุล
            </span>
          </div>
        </header>

        {/* Content Box wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6 pb-28 lg:pb-8">
          <AnimatePresence mode="wait">
            {currentScreen === "menu" ? (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* 1. HERO/BANNER FOR NEW WORKSPACE STYLE */}
                <div className="relative overflow-hidden bg-gradient-to-r from-neutral-900 via-[#991B1B] to-[#7F1D1D] text-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-800">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_50%)] pointer-events-none" />
                  <div className="space-y-3 relative z-10 max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-500/30 tracking-wide uppercase">
                      <Zap size={12} className="text-amber-400" />
                      ระบบสแตนด์บายทำงานแบบออฟไลน์และซิงก์เรียลไทม์ 100%
                    </span>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent">
                      เครื่องคำนวณราคาและขนส่งพงษ์สกุล
                    </h2>
                    <p className="text-xs md:text-sm text-neutral-200/90 font-light leading-relaxed">
                      คำนวณใบเสนอราคาแผ่นพื้น เสาเข็ม ท่อระบายน้ำ และจำลองระวางน้ำหนักขนส่ง ปลอดภัยตามกฎหมายทางหลวง พร้อมเลือกซัพพลายเออร์ที่คุ้มค่าที่สุด
                    </p>
                  </div>
                </div>

                {/* 2. LIVE DASHBOARD QUICK SUMMARY (STATS TILES) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                  <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-400">ราคากลางแผ่นทั่วไป</p>
                      <p className="text-2xl font-black font-mono text-neutral-800">
                        ฿{settings.prices.normalBoardPrice} <span className="text-xs font-bold text-neutral-400">/ตร.ม.</span>
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 text-[#C62828] rounded-xl">
                      <Package size={20} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-400">ราคากลางแผ่น มอก.</p>
                      <p className="text-2xl font-black font-mono text-neutral-800">
                        ฿{settings.prices.mocBoardPrice} <span className="text-xs font-bold text-neutral-400">/ตร.ม.</span>
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 text-[#C62828] rounded-xl">
                      <Layers size={20} />
                    </div>
                  </div>

                  <div 
                    onClick={() => setSupplierDropdownOpen(true)}
                    className="bg-white hover:bg-neutral-50/80 cursor-pointer rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between transition group"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                        โรงงานที่ใช้งาน
                        <ChevronRight size={12} className="text-neutral-400 group-hover:text-[#C62828] transition" />
                      </p>
                      <p className="text-lg font-black text-neutral-800 truncate max-w-[150px]">
                        {activeSupplier.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        รหัส: {activeSupplier.code || activeSupplier.id}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 text-[#C62828] rounded-xl group-hover:bg-[#C62828] group-hover:text-white transition">
                      <Factory size={20} />
                    </div>
                  </div>

                  <div 
                    onClick={() => handleScreenChange("weight")}
                    className="bg-white hover:bg-neutral-50/80 cursor-pointer rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between transition group"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                        ระวางสะสมขนส่ง
                        <ChevronRight size={12} className="text-neutral-400 group-hover:text-amber-600 transition" />
                      </p>
                      <p className="text-2xl font-black font-mono text-neutral-800">
                        {(totalWeightKg / 1000).toFixed(2)} <span className="text-xs font-bold text-neutral-400">ตัน</span>
                      </p>
                      {recommendedTruckText && (
                        <p className="text-[10px] text-amber-600 font-bold truncate max-w-[140px]">
                          {recommendedTruckText}
                        </p>
                      )}
                    </div>
                    <div className="p-3 bg-amber-50 text-[#F59E0B] rounded-xl group-hover:bg-[#F59E0B] group-hover:text-white transition">
                      <Truck size={20} />
                    </div>
                  </div>
                </div>

                {/* 3. BENTO NAV GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <MenuCard
                    onClick={() => handleScreenChange("price")}
                    icon={Calculator}
                    title="คำนวณราคาเดี่ยว"
                    description="ระบุข้อมูลแผ่นพื้น เสาเข็ม หรือท่อระบายน้ำเพื่อประเมินราคาต่อหน่วย เช็คความหนาลวดที่ปลอดภัยและส่งต่อไประวางรถได้ทันที"
                    tagText="คำนวณแยก"
                    accentColor="red"
                  />
                  <MenuCard
                    onClick={() => handleScreenChange("scan")}
                    icon={Sparkles}
                    title="คำนวณหลายรายการ AI"
                    description="สแกนใบประมาณราคาของลูกค้า วางข้อความดิบ หรือคีย์สินค้าหลายประเภทพร้อมกันในบิลเดียว คำนวณสรุปราคาและน้ำหนักรวมอัจฉริยะ"
                    badge="แนะนำ"
                    tagText="อเนกประสงค์"
                    accentColor="amber"
                  />
                  <MenuCard
                    onClick={() => handleScreenChange("weight")}
                    icon={Scale}
                    title="คำนวณระวางขนส่ง"
                    description="รวมกองน้ำหนักสะสมผลิตภัณฑ์คอนกรีต แนะนำจัดสรรรถขนส่งที่คุ้มค่าที่สุด (4ล้อ, 6ล้อ, 10ล้อ, เทรลเลอร์) ปลอดภัยต่อกฎหมายทางหลวง"
                    tagText="โลจิสติกส์"
                    accentColor="emerald"
                  />
                  <MenuCard
                    onClick={() => handleScreenChange("settings")}
                    icon={Settings}
                    title="ราคากลาง & แค็ตตาล็อก"
                    description="กำหนดราคากลางของแต่ละโรงงาน/ซัพพลายเออร์ จัดการข้อมูลน้ำหนักมาตรฐาน และดาวน์โหลดแค็ตตาล็อกคอนกรีตส่งให้ลูกค้า"
                    tagText="ฐานข้อมูล"
                    accentColor="indigo"
                  />
                </div>
              </motion.div>
            ) : currentScreen === "price" ? (
              <motion.div
                key="price"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {/* Clean Horizontal Sub-tab bar with no-scrollbar for smooth mobile use */}
                <div className="overflow-x-auto no-scrollbar pb-1">
                  <div className="bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200/80 flex items-center gap-1.5 w-fit min-w-full sm:min-w-0 shadow-inner">
                    <button
                      onClick={() => setPriceSubTab("slab")}
                      className={`py-2.5 px-4 rounded-xl font-bold text-xs md:text-sm text-center transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                        priceSubTab === "slab"
                          ? "bg-[#C62828] text-white shadow-md shadow-red-900/10"
                          : "text-neutral-600 hover:text-[#C62828] hover:bg-white/60"
                      }`}
                    >
                      <Package size={15} />
                      แผ่นพื้นสำเร็จรูป
                    </button>
                    <button
                      onClick={() => setPriceSubTab("pile")}
                      className={`py-2.5 px-4 rounded-xl font-bold text-xs md:text-sm text-center transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                        priceSubTab === "pile"
                          ? "bg-[#C62828] text-white shadow-md shadow-red-900/10"
                          : "text-neutral-600 hover:text-[#C62828] hover:bg-white/60"
                      }`}
                    >
                      <Zap size={15} />
                      เสาเข็มคอนกรีต / เสารั้ว
                    </button>
                    <button
                      onClick={() => setPriceSubTab("hollowCore")}
                      className={`py-2.5 px-4 rounded-xl font-bold text-xs md:text-sm text-center transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                        priceSubTab === "hollowCore"
                          ? "bg-[#C62828] text-white shadow-md shadow-red-900/10"
                          : "text-neutral-600 hover:text-[#C62828] hover:bg-white/60"
                      }`}
                    >
                      <Layers size={15} />
                      แผ่นพื้นกลวง (Hollow Core)
                    </button>
                    <button
                      onClick={() => setPriceSubTab("drainage")}
                      className={`py-2.5 px-4 rounded-xl font-bold text-xs md:text-sm text-center transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                        priceSubTab === "drainage"
                          ? "bg-[#C62828] text-white shadow-md shadow-red-900/10"
                          : "text-neutral-600 hover:text-[#C62828] hover:bg-white/60"
                      }`}
                    >
                      <Droplets size={15} />
                      ท่อระบายน้ำ / บ่อพัก
                    </button>
                  </div>
                </div>

                {/* Sub components inside calculations tab */}
                <div className="bg-white rounded-3xl p-1 md:p-2 border border-neutral-200/60 shadow-xs">
                  {priceSubTab === "slab" && (
                    <SlabCalculator 
                      settings={settings} 
                      weightItems={weightItems}
                      setWeightItems={setWeightItems}
                      onNavigateToWeight={() => handleScreenChange("weight")}
                      onSelectSupplier={handleSelectSupplier}
                      onNavigateToSettings={() => handleScreenChange("settings")}
                    />
                  )}
                  {priceSubTab === "pile" && (
                    <PileCalculator 
                      settings={settings} 
                      onSelectSupplier={handleSelectSupplier}
                      onNavigateToSettings={() => handleScreenChange("settings")}
                    />
                  )}
                  {priceSubTab === "hollowCore" && (
                    <HollowCoreCalculator 
                      settings={settings} 
                      onSelectSupplier={handleSelectSupplier}
                      onNavigateToSettings={() => handleScreenChange("settings")}
                    />
                  )}
                  {priceSubTab === "drainage" && (
                    <DrainageCalculator 
                      settings={settings} 
                      weightItems={weightItems}
                      setWeightItems={setWeightItems}
                      onNavigateToWeight={() => handleScreenChange("weight")}
                      onSelectSupplier={handleSelectSupplier}
                      onNavigateToSettings={() => handleScreenChange("settings")}
                    />
                  )}
                </div>
              </motion.div>
            ) : currentScreen === "scan" ? (
              <motion.div
                key="scan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                <div className="bg-white rounded-3xl p-1 md:p-2 border border-neutral-200/60 shadow-sm">
                  <UniversalBatchCalculator 
                    settings={settings} 
                    setSettings={setSettings}
                    weightItems={weightItems}
                    setWeightItems={setWeightItems} 
                    onNavigateToWeight={() => handleScreenChange("weight")}
                    onSelectSupplier={handleSelectSupplier}
                    onNavigateToSettings={() => handleScreenChange("settings")}
                  />
                </div>
              </motion.div>
            ) : currentScreen === "weight" ? (
              <motion.div
                key="weight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                <div className="bg-white rounded-3xl p-1 md:p-2 border border-neutral-200/60 shadow-sm">
                  <WeightCalculator 
                    settings={settings} 
                    items={weightItems} 
                    setItems={setWeightItems} 
                    onSelectSupplier={handleSelectSupplier}
                    onNavigateToSettings={() => handleScreenChange("settings")}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                <div className="bg-white rounded-3xl p-1 md:p-2 border border-neutral-200/60 shadow-sm">
                  <SettingsPanel settings={settings} setSettings={setSettings} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Cohesive Brand Footer */}
        <footer className="bg-neutral-900 text-neutral-400 py-8 border-t border-neutral-800 text-xs sm:text-sm mt-auto hidden lg:block">
          <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left space-y-1">
              <span className="font-extrabold font-display text-white uppercase tracking-wider text-sm block">
                บริษัท พงษ์สกุลฮาร์ดแวร์ จำกัด
              </span>
              <p className="font-light text-neutral-500">
                ผู้ผลิตแผ่นพื้นคอนกรีตสำเร็จรูป แผ่นพื้นรูกลวง (Hollow Core) เสาเข็ม มอก. และท่อระบายน้ำอุตสาหกรรมในภาคตะวันออก
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1 text-neutral-500 font-mono text-[10px]">
              <span>© {new Date().getFullYear()} Pongsakul Hardware. All Rights Reserved.</span>
              <span className="bg-neutral-800 text-neutral-400 py-0.5 px-2 rounded border border-neutral-700/40">
                พร้อมทำงานแบบออฟไลน์ 100%
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* 4. MOBILE FLOATING WEIGHT PILL (Appears when items are in cargo & not on weight screen) */}
      <AnimatePresence>
        {totalWeightKg > 0 && currentScreen !== "weight" && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-[72px] left-3 right-3 z-30 lg:hidden"
          >
            <button
              onClick={() => handleScreenChange("weight")}
              className="w-full bg-neutral-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-neutral-700/80 flex items-center justify-between active:scale-98 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
                  <Truck size={16} />
                </div>
                <div className="text-left truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-200">ระวางสะสม:</span>
                    <span className="text-xs font-black font-mono text-amber-400">
                      {(totalWeightKg / 1000).toFixed(2)} ตัน
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">({weightItems.length} รายการ)</span>
                  </div>
                  {recommendedTruckText && (
                    <p className="text-[10px] text-neutral-400 truncate">
                      รถที่แนะนำ: <strong className="text-white">{recommendedTruckText}</strong>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 shrink-0 ml-2">
                <span>ตรวจรถ</span>
                <ChevronRight size={14} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. MOBILE FIXED BOTTOM NAVIGATION BAR (Thumb-friendly, min 48px touch targets) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-2xl safe-pb">
        <div className="grid grid-cols-5 h-[62px]">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleScreenChange(item.id)}
                className={`flex flex-col items-center justify-center py-1 relative min-h-[48px] active:scale-95 transition-all duration-150 cursor-pointer ${
                  isActive ? "text-[#C62828]" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {/* Active Indicator Top Line */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute top-0 w-8 h-1 bg-[#C62828] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon Container with Badge */}
                <div className="relative mt-1">
                  <Icon size={20} className={isActive ? "stroke-[2.4]" : "stroke-[1.8]"} />
                  {item.countBadge && (
                    <span className="absolute -top-1.5 -right-2.5 bg-[#C62828] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {item.countBadge}
                    </span>
                  )}
                  {item.badge && !item.countBadge && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </div>

                {/* Label */}
                <span className={`text-[10px] tracking-tight mt-1 leading-none ${isActive ? "font-bold text-[#C62828]" : "font-medium"}`}>
                  {item.id === "menu" && "หน้าหลัก"}
                  {item.id === "price" && "คิดราคา"}
                  {item.id === "scan" && "สแกน AI"}
                  {item.id === "weight" && "ระวางรถ"}
                  {item.id === "settings" && "แค็ตตาล็อก"}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 6. CLOUD DIAGNOSTIC & HEALTH MODAL */}
      <AnimatePresence>
        {cloudModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-3xl shadow-2xl border border-neutral-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              {/* Modal Close Button */}
              <button
                type="button"
                onClick={() => setCloudModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition z-10 cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>

              <div className="p-2 sm:p-4">
                <CloudSystemStatusCard settings={settings} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
