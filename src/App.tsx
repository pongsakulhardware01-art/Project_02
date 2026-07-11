import { useState, useEffect } from "react";
import { AppSettings, WeightItem } from "./types";
import { defaultSettings, APP_VERSION, weightOptions, truckCapacities } from "./data";
import SlabCalculator from "./components/SlabCalculator";
import PileCalculator from "./components/PileCalculator";
import HollowCoreCalculator from "./components/HollowCoreCalculator";
import DrainageCalculator from "./components/DrainageCalculator";
import WeightCalculator from "./components/WeightCalculator";
import SettingsPanel from "./components/SettingsPanel";
import UniversalBatchCalculator from "./components/UniversalBatchCalculator";
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
  Truck,
  TrendingUp,
  FileText
} from "lucide-react";

const MenuCard = ({
  onClick,
  icon: Icon,
  title,
  description,
  badge,
}: {
  onClick: () => void;
  icon: any;
  title: string;
  description: string;
  badge?: string;
}) => (
  <motion.button
    whileHover={{ y: -6, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="bg-white hover:border-[#C62828] text-left p-6 md:p-8 rounded-3xl border border-neutral-200/80 shadow-md hover:shadow-xl group transition-all duration-300 flex flex-col justify-between h-[240px] relative overflow-hidden"
  >
    {/* Subtle gradient light background on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    <div className="flex items-start justify-between w-full relative z-10">
      <div className="p-3.5 bg-red-50 text-[#C62828] rounded-2xl group-hover:bg-[#C62828] group-hover:text-white shadow-sm group-hover:shadow-md transition-all duration-300 w-fit">
        <Icon size={26} />
      </div>
      {badge && (
        <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider animate-pulse">
          {badge}
        </span>
      )}
    </div>

    <div className="space-y-2 relative z-10 mt-4">
      <h3 className="font-extrabold text-neutral-800 text-lg md:text-xl group-hover:text-[#C62828] transition-colors duration-200 flex items-center justify-between">
        <span>{title}</span>
        <ChevronRight size={18} className="text-neutral-300 group-hover:text-[#C62828] transform group-hover:translate-x-1.5 transition-all duration-300" />
      </h3>
      <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed line-clamp-3">{description}</p>
    </div>
  </motion.button>
);

export default function App() {
  // Navigation State
  // "menu", "price", "scan", "weight", "settings"
  const [currentScreen, setCurrentScreen] = useState<string>("menu");
  // Sub-tab inside Price category
  // "slab", "pile", "hollowCore", "drainage"
  const [priceSubTab, setPriceSubTab] = useState<string>("slab");
  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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
        prices: { ...defaultSettings.prices, ...baked.prices },
        weights: { ...defaultSettings.weights, ...baked.weights },
      };
    }

    const saved = localStorage.getItem("pongsakulSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          prices: { ...defaultSettings.prices, ...parsed.prices },
          weights: { ...defaultSettings.weights, ...parsed.weights },
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
    const opt = weightOptions.find((o) => o.value === typeValue);
    if (!opt) return 0;
    return settings.weights[opt.weightKey] || 0;
  };

  const calculateItemWeight = (item: WeightItem): number => {
    const rawWPerMeter = item.unitWeight !== undefined ? item.unitWeight : getWeightPerMeter(item.type);
    const wPerMeter = rawWPerMeter === "" ? 0 : rawWPerMeter;
    const isPerPieceItem = item.type.startsWith("pipe") || item.type.startsWith("basin");
    const len = isPerPieceItem ? 1.0 : (item.length === "" ? 0 : item.length);
    const cnt = item.count === "" ? 0 : item.count;
    return wPerMeter * len * cnt;
  };

  const totalWeightKg = weightItems.reduce((sum, item) => sum + calculateItemWeight(item), 0);
  const totalItemCount = weightItems.reduce((sum, item) => sum + (item.count === "" ? 0 : item.count), 0);

  // Recommended truck based on weight
  const getRecommendedTruck = () => {
    if (totalWeightKg === 0) return null;
    const fit = truckCapacities.find((truck) => truck.capacityKg >= totalWeightKg);
    return fit || { name: "น้ำหนักเกินพิกัดสูงสุด", capacityKg: 31000, label: "รถพ่วงพิกัดเสริม" };
  };

  const recommendedTruck = getRecommendedTruck();

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

        {/* Real-time sync status banner */}
        <div className="px-6 py-3 bg-neutral-950/40 border-b border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            เชื่อมต่อคลาวด์เรียลไทม์
          </span>
          <span className="font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] text-neutral-300">
            {APP_VERSION}
          </span>
        </div>

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
            {recommendedTruck && (
              <div className="pt-2 border-t border-neutral-800 space-y-1.5">
                <p className="text-[11px] text-neutral-400 flex justify-between">
                  <span>รถจัดส่งแนะนำ:</span>
                  <span className="font-extrabold text-[#F59E0B]">{recommendedTruck.name}</span>
                </p>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalWeightKg / recommendedTruck.capacityKg) * 100)}%` }}
                  />
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
          <p className="font-light">ระบบคำนวณราคากลางอัจฉริยะ</p>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION BAR */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#C62828] bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Hammer size={18} className="text-amber-300" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase">PONGSAKUL</h1>
              <p className="text-[9px] font-light text-red-100 leading-none">เครื่องคำนวณราคาและขนส่ง</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {totalWeightKg > 0 && (
              <span className="bg-amber-500 text-neutral-900 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Truck size={12} />
                {(totalWeightKg / 1000).toFixed(1)}t
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-white/10 rounded-xl transition"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-neutral-900 border-t border-neutral-800 overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleScreenChange(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-[#C62828] text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      {item.countBadge && (
                        <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                          {item.countBadge} รายการ
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Status bar */}
        <header className="hidden lg:flex items-center justify-between bg-white border-b border-neutral-200/60 px-8 py-4.5 shrink-0">
          <div>
            <h2 className="text-xl font-bold font-display text-neutral-800">
              {currentScreen === "menu" && "แผงสรุปข้อมูลแดชบอร์ด"}
              {currentScreen === "price" && "คำนวณราคาเฉพาะรายการเดี่ยว"}
              {currentScreen === "scan" && "ระบบสแกนเอกสารและประมาณราคารวม AI"}
              {currentScreen === "weight" && "การคำนวณพิกัดและจำลองการจัดเรียงน้ำหนัก"}
              {currentScreen === "settings" && "แผงตารางราคากลางส่วนกลางและแค็ตตาล็อก"}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
              <span>บริษัท พงษ์สกุลคอนกรีต จำกัด</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#C62828] font-medium">
                <Clock size={12} /> {thaiDate}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200/50 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              เชื่อมคลาวด์สตรีม
            </span>
            <div className="h-8 w-px bg-neutral-200" />
            <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <User size={15} className="text-[#C62828]" />
              pongsakul.co.th (แอดมิน)
            </span>
          </div>
        </header>

        {/* Content Box wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
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
                <div className="relative overflow-hidden bg-gradient-to-r from-neutral-900 via-[#991B1B] to-[#7F1D1D] text-white rounded-3xl p-6 md:p-8 shadow-md border border-neutral-800">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_50%)] pointer-events-none" />
                  <div className="space-y-3 relative z-10 max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-500/20 tracking-wide uppercase">
                      <Zap size={12} className="text-amber-400" />
                      ระบบสแตนด์บายทำงานแบบออฟไลน์และซิงก์เรียลไทม์ 100%
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent">
                      เครื่องคำนวณราคาและขนส่งพงษ์สกุล
                    </h2>
                    <p className="text-xs md:text-sm text-neutral-200/90 font-light leading-relaxed">
                      สนับสนุนผู้จัดการฝ่ายขายและวิศวกรรมขนส่งในเครือ บริษัท พงษ์สกุลคอนกรีต จำกัด ช่วยคำนวณใบสั่งซื้อทั่วไป ตรวจสอบราคาส่วนกลาง และจัดวางตารางขนส่งอย่างเป็นระบบเพื่อความถูกต้อง รวดเร็ว และเป็นสากล
                    </p>
                  </div>
                </div>

                {/* 2. LIVE DASHBOARD QUICK SUMMARY (STATS TILES) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white rounded-2xl p-5 border border-neutral-200/60 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-400">ราคากลางแผ่นสำเร็จทั่วไป</p>
                      <p className="text-2xl font-black font-mono text-neutral-800">
                        ฿{settings.prices.normalBoardPrice} <span className="text-xs font-bold text-neutral-400">/ตร.ม.</span>
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 text-[#C62828] rounded-xl">
                      <Package size={20} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-neutral-200/60 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-400">ราคากลางแผ่น มอก. (TIS)</p>
                      <p className="text-2xl font-black font-mono text-neutral-800">
                        ฿{settings.prices.mocBoardPrice} <span className="text-xs font-bold text-neutral-400">/ตร.ม.</span>
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 text-[#C62828] rounded-xl">
                      <Layers size={20} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-neutral-200/60 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-400">รวมระวางสะสมขนส่ง</p>
                      <p className="text-2xl font-black font-mono text-neutral-800">
                        {(totalWeightKg / 1000).toFixed(2)} <span className="text-xs font-bold text-neutral-400">ตัน</span>
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 text-[#F59E0B] rounded-xl">
                      <Truck size={20} />
                    </div>
                  </div>
                </div>

                {/* 3. BENTO NAV GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MenuCard
                    onClick={() => handleScreenChange("price")}
                    icon={Calculator}
                    title="คำนวณราคาเดี่ยว"
                    description="ระบุข้อมูลแผ่นพื้น เสาเข็มรั้ว หรือแผ่นรูกลวงกลมเพื่อประเมินราคารวมแวตและตรวจสอบความหนาลวดที่ปลอดภัย"
                  />
                  <MenuCard
                    onClick={() => handleScreenChange("scan")}
                    icon={Sparkles}
                    title="คำนวณหลายรายการ AI"
                    description="สแกนใบประมาณราคาของลูกค้า วางข้อมูลดิบ หรือคีย์สเปรดชีตรวมสินค้าทุกประเภทในหน้าเอกสารใบเสนอราคาเดียว"
                    badge="แนะนำ"
                  />
                  <MenuCard
                    onClick={() => handleScreenChange("weight")}
                    icon={Scale}
                    title="คำนวณระวางขนส่ง"
                    description="รวมกองน้ำหนักสะสมผลิตภัณฑ์คอนกรีต ประเมินรุ่นรถขนส่ง ปลอดภัยจากด่านตรวจน้ำหนัก สรรพสามิตไม่จับแน่นอน"
                  />
                  <MenuCard
                    onClick={() => handleScreenChange("settings")}
                    icon={Settings}
                    title="ราคากลาง & แค็ตตาล็อก"
                    description="เข้าสู่อินสแตนซ์ราคารวมค่าส่งกลาง ดาวน์โหลดเอกสารโบชัวร์ทางวิศวกรรมสำหรับส่งเสริมงานเสนอสเปกแอดมิน"
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
                {/* Nested tabs inside Price category */}
                <div className="bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200/50 flex flex-wrap gap-1.5 w-fit shadow-inner">
                  <button
                    onClick={() => setPriceSubTab("slab")}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs md:text-sm text-center transition flex items-center justify-center gap-2 ${
                      priceSubTab === "slab"
                        ? "bg-[#C62828] text-white shadow-md shadow-red-900/10"
                        : "text-neutral-500 hover:text-[#C62828] hover:bg-white/60"
                    }`}
                  >
                    <Package size={15} />
                    แผ่นพื้นสำเร็จรูป
                  </button>
                  <button
                    onClick={() => setPriceSubTab("pile")}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs md:text-sm text-center transition flex items-center justify-center gap-2 ${
                      priceSubTab === "pile"
                        ? "bg-[#C62828] text-white shadow-md shadow-red-900/10"
                        : "text-neutral-500 hover:text-[#C62828] hover:bg-white/60"
                    }`}
                  >
                    <Zap size={15} />
                    เสาเข็มคอนกรีต / เสารั้ว
                  </button>
                  <button
                    onClick={() => setPriceSubTab("hollowCore")}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs md:text-sm text-center transition flex items-center justify-center gap-2 ${
                      priceSubTab === "hollowCore"
                        ? "bg-[#C62828] text-white shadow-md shadow-red-900/10"
                        : "text-neutral-500 hover:text-[#C62828] hover:bg-white/60"
                    }`}
                  >
                    <Layers size={15} />
                    แผ่นพื้นกลวง (Hollow Core)
                  </button>
                  <button
                    onClick={() => setPriceSubTab("drainage")}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs md:text-sm text-center transition flex items-center justify-center gap-2 ${
                      priceSubTab === "drainage"
                        ? "bg-[#C62828] text-white shadow-md shadow-red-900/10"
                        : "text-neutral-500 hover:text-[#C62828] hover:bg-white/60"
                    }`}
                  >
                    <Droplets size={15} />
                    ท่อระบายน้ำ / บ่อพัก
                  </button>
                </div>

                {/* Sub components inside calculations tab */}
                <div className="bg-white rounded-3xl p-1 md:p-2 border border-neutral-200/60 shadow-sm">
                  {priceSubTab === "slab" && (
                    <SlabCalculator 
                      settings={settings} 
                      weightItems={weightItems}
                      setWeightItems={setWeightItems}
                      onNavigateToWeight={() => handleScreenChange("weight")}
                    />
                  )}
                  {priceSubTab === "pile" && <PileCalculator settings={settings} />}
                  {priceSubTab === "hollowCore" && <HollowCoreCalculator settings={settings} />}
                  {priceSubTab === "drainage" && (
                    <DrainageCalculator 
                      settings={settings} 
                      weightItems={weightItems}
                      setWeightItems={setWeightItems}
                      onNavigateToWeight={() => handleScreenChange("weight")}
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
                    weightItems={weightItems}
                    setWeightItems={setWeightItems} 
                    onNavigateToWeight={() => handleScreenChange("weight")}
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
                  <WeightCalculator settings={settings} items={weightItems} setItems={setWeightItems} />
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
        <footer className="bg-neutral-900 text-neutral-400 py-8 border-t border-neutral-800 text-xs sm:text-sm mt-auto">
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

    </div>
  );
}
