import React, { useState, useEffect } from "react";
import { AppSettings, SupplierProfile, DeliveryDestination } from "../types";
import { defaultSuppliers } from "../data";
import { 
  parseGoogleMapsInput, 
  calculateSupplierDelivery, 
  isValidLatLng, 
  PRESET_LOCATIONS, 
  DeliveryCalculationResult 
} from "../utils/geoUtils";
import { fmt } from "../utils";
import { 
  MapPin, 
  Navigation, 
  Truck, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  Scale,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DeliveryDistanceWidgetProps {
  supplier?: SupplierProfile;
  settings?: AppSettings;
  allSuppliers?: SupplierProfile[];
  onSelectSupplier?: (supplierId: string) => void;
  onNavigateToSettings?: () => void;
  orderTotalAmount?: number;
  orderAmount?: number;
  totalWeightKg?: number;
  onApplyDeliveryFee?: (fee: number, distanceKm: number, isFree: boolean) => void;
  appliedDeliveryFee?: number;
  initialDestination?: DeliveryDestination;
  compact?: boolean;
}

export default function DeliveryDistanceWidget({
  supplier: propSupplier,
  settings,
  allSuppliers: propAllSuppliers,
  onSelectSupplier,
  onNavigateToSettings,
  orderTotalAmount = 0,
  orderAmount = 0,
  totalWeightKg = 0,
  onApplyDeliveryFee,
  appliedDeliveryFee,
  initialDestination,
  compact = false
}: DeliveryDistanceWidgetProps) {
  const activeSupplier: SupplierProfile = propSupplier || 
    (settings?.suppliers?.find(s => s.id === settings?.activeSupplierId) || settings?.suppliers?.[0] || defaultSuppliers[0]);
  
  const suppliersList: SupplierProfile[] = (propAllSuppliers && propAllSuppliers.length > 0) 
    ? propAllSuppliers 
    : (settings?.suppliers || defaultSuppliers);

  const effectiveOrderAmount = orderTotalAmount || orderAmount || 0;
  // Destination input state - Clean blank by default so the user inputs everything themselves
  const [destAddress, setDestAddress] = useState<string>(() => initialDestination?.address || "");
  const [destMapsInput, setDestMapsInput] = useState<string>(() => initialDestination?.mapsUrl || "");
  const [destLat, setDestLat] = useState<number | undefined>(() => initialDestination?.lat);
  const [destLng, setDestLng] = useState<number | undefined>(() => initialDestination?.lng);

  const [showPresets, setShowPresets] = useState(false);
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [showSupplierComparison, setShowSupplierComparison] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [parseNotice, setParseNotice] = useState<string | null>(null);
  const [lastUpdatedKey, setLastUpdatedKey] = useState<number>(Date.now());

  // Clean old localStorage cached dummy coords if any to maintain a clean blank slate
  useEffect(() => {
    localStorage.removeItem("pongsakul_last_dest_address");
    localStorage.removeItem("pongsakul_last_dest_maps");
    localStorage.removeItem("pongsakul_last_dest_lat");
    localStorage.removeItem("pongsakul_last_dest_lng");
  }, []);

  // Clear all destination inputs handler
  const handleClearAll = () => {
    setDestAddress("");
    setDestMapsInput("");
    setDestLat(undefined);
    setDestLng(undefined);
    setParseNotice(null);
    setLastUpdatedKey(Date.now());
    if (onApplyDeliveryFee) {
      onApplyDeliveryFee(0, 0, false);
    }
  };

  // Real-time Instant Parser on address text change
  const handleAddressChange = (val: string) => {
    setDestAddress(val);
    setLastUpdatedKey(Date.now());

    if (!val.trim()) {
      if (!destMapsInput) {
        setDestLat(undefined);
        setDestLng(undefined);
      }
      return;
    }

    // Check if user pasted coordinates or known location directly into address field
    const parsed = parseGoogleMapsInput(val);
    if (isValidLatLng(parsed.lat, parsed.lng)) {
      setDestLat(parsed.lat);
      setDestLng(parsed.lng);
      setDestMapsInput(`${parsed.lat}, ${parsed.lng}`);
      setParseNotice(parsed.matchedName ? `⚡ อัปเดตพิกัด: ${parsed.matchedName}` : `⚡ ตรวจพบพิกัด ${parsed.lat?.toFixed(4)}, ${parsed.lng?.toFixed(4)}`);
      setTimeout(() => setParseNotice(null), 2500);
    }
  };

  // Real-time Instant Parser on Google Maps link or coordinates input change
  const handleMapsInputChange = (val: string) => {
    setDestMapsInput(val);
    setLastUpdatedKey(Date.now());

    if (!val.trim()) {
      setDestLat(undefined);
      setDestLng(undefined);
      return;
    }

    const parsed = parseGoogleMapsInput(val);
    if (isValidLatLng(parsed.lat, parsed.lng)) {
      setDestLat(parsed.lat);
      setDestLng(parsed.lng);
      if (parsed.address && (!destAddress || destAddress.includes("13.") || destAddress.includes("พิกัด"))) {
        setDestAddress(parsed.address);
      } else if (parsed.matchedName && !destAddress) {
        setDestAddress(parsed.matchedName);
      }
      setParseNotice(`⚡ อัปเดตพิกัด ${parsed.lat?.toFixed(4)}, ${parsed.lng?.toFixed(4)} ทันที`);
      setTimeout(() => setParseNotice(null), 2500);
    }
  };

  // Handle direct manual latitude / longitude edits
  const handleManualCoordChange = (type: "lat" | "lng", val: string) => {
    const num = parseFloat(val);
    setLastUpdatedKey(Date.now());
    if (type === "lat") {
      setDestLat(isNaN(num) ? undefined : num);
      if (!isNaN(num) && isValidLatLng(num, destLng)) {
        setDestMapsInput(`${num}, ${destLng}`);
      }
    } else {
      setDestLng(isNaN(num) ? undefined : num);
      if (!isNaN(num) && isValidLatLng(destLat, num)) {
        setDestMapsInput(`${destLat}, ${num}`);
      }
    }
  };

  // Auto-parse when maps input changes from external props or mount
  useEffect(() => {
    if (!destMapsInput.trim()) return;

    const parsed = parseGoogleMapsInput(destMapsInput);
    if (isValidLatLng(parsed.lat, parsed.lng)) {
      setDestLat(parsed.lat);
      setDestLng(parsed.lng);
      if (parsed.address && !destAddress) {
        setDestAddress(parsed.address);
      }
    }
  }, [destMapsInput]);

  // Current calculation result
  const calcResult: DeliveryCalculationResult | null = calculateSupplierDelivery(
    activeSupplier,
    destLat,
    destLng,
    destAddress,
    "หน้างานลูกค้า",
    effectiveOrderAmount
  );

  // Notify parent component about delivery fee
  useEffect(() => {
    if (calcResult && onApplyDeliveryFee) {
      onApplyDeliveryFee(calcResult.deliveryFee, calcResult.distanceKm, calcResult.isFreeDelivery);
    }
  }, [calcResult?.deliveryFee, calcResult?.distanceKm, calcResult?.isFreeDelivery]);

  // Handle GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง GPS");
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDestLat(lat);
        setDestLng(lng);
        const mapCoordStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setDestMapsInput(mapCoordStr);
        setDestAddress((prev) => prev || `ตำแหน่ง GPS ปัจจุบัน (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setIsGpsLoading(false);
        setParseNotice("📍 ระบุตำแหน่งปัจจุบันสำเร็จแล้ว");
        setTimeout(() => setParseNotice(null), 3000);
      },
      (err) => {
        setIsGpsLoading(false);
        alert(`ไม่สามารถดึงตำแหน่งได้: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Select Preset Location
  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setDestAddress(preset.name);
    setDestLat(preset.lat);
    setDestLng(preset.lng);
    setDestMapsInput(`${preset.lat}, ${preset.lng}`);
    setLastUpdatedKey(Date.now());
    setShowPresets(false);
    setParseNotice(`📌 เลือก ${preset.name} (คำนวณใหม่เรียลไทม์แล้ว)`);
    setTimeout(() => setParseNotice(null), 2500);
  };

  // Copy delivery summary to clipboard
  const handleCopySummary = () => {
    if (!calcResult) return;
    const originAddr = activeSupplier.supplierLocation?.address || activeSupplier.location || activeSupplier.name;
    const tiers = activeSupplier.deliveryConfig?.distanceTiers;
    const tiersSummary = tiers && tiers.length > 0
      ? tiers.map(t => `${t.minKm}-${t.maxKm} กม. = ${t.price === 0 ? "ฟรี" : `฿${t.price}`}`).join(" | ")
      : `ส่งฟรี ${calcResult.freeRadiusKm} กม. แรก | ส่วนเกิน ${calcResult.ratePerKm} บ./กม.`;

    const text = `🚚 สรุปการคำนวณระยะทางและค่าจัดส่ง (พงษ์สกุลฮาร์ดแวร์)\n` +
      `-----------------------------------------\n` +
      `🏢 โรงงานต้นทาง: ${activeSupplier.name}\n` +
      `📍 ที่อยู่โรงงาน: ${originAddr}\n` +
      `🏗️ หน้างานจัดส่ง: ${destAddress || "ตามพิกัด"}\n` +
      `📏 ระยะทางขนส่ง: ${calcResult.distanceKm} กม.\n` +
      `🏷️ เงื่อนไขช่วงราคา: ${tiersSummary}\n` +
      `-----------------------------------------\n` +
      `💰 สถานะค่าส่ง: ${calcResult.isFreeDelivery ? "🎉 ฟรีค่าขนส่ง (฿0)" : `฿${fmt(calcResult.deliveryFee)} บาท`}\n` +
      `💡 รายละเอียด: ${calcResult.reason}\n` +
      `🗺️ นำทาง Google Maps: ${calcResult.directionsUrl}\n` +
      `-----------------------------------------`;

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const originLat = activeSupplier.supplierLocation?.lat || 13.5475;
  const originLng = activeSupplier.supplierLocation?.lng || 100.2745;
  const originAddress = activeSupplier.supplierLocation?.address || activeSupplier.location || "ต.ท่าทราย อ.เมือง จ.สมุทรสาคร";
  const freeRadius = activeSupplier.deliveryConfig?.freeRadiusKm ?? 30;
  const ratePerKm = activeSupplier.deliveryConfig?.ratePerKm ?? 25;
  const baseFee = activeSupplier.deliveryConfig?.basePrice ?? 0;
  const tiers = activeSupplier.deliveryConfig?.distanceTiers || [];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm overflow-hidden mb-6 transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 px-4 sm:px-6 py-3.5 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600/90 flex items-center justify-center text-white shadow-sm">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-wide text-white">คำนวณระยะทาง & ค่าขนส่ง Google Maps</span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                แยกตามซัพพลายเออร์
              </span>
            </div>
            <p className="text-xs text-neutral-300">
              ต้นทาง: <strong className="text-white font-semibold">{activeSupplier.name}</strong> (ส่งฟรี {freeRadius} กม. แรก)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToSettings && (
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="inline-flex items-center gap-1 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg border border-white/20 transition-colors"
              title="ตั้งค่าพิกัดและเงื่อนไขส่งฟรีของซัพพลายเออร์"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>ตั้งค่าพิกัดโรงงาน</span>
            </button>
          )}

          {calcResult && (
            <a
              href={calcResult.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg border border-white/20 transition-colors"
              title="เปิดดูเส้นทางและนำทางจริงบน Google Maps"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>เปิด Google Maps ↗</span>
            </a>
          )}
          
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg border border-white/20 transition-colors"
            title="คัดลอกสรุปค่าขนส่ง"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-300" />}
            <span>{isCopied ? "คัดลอกแล้ว" : "คัดลอกสรุป"}</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Origin and Destination Dual Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/80">
          {/* 1. Origin (Supplier Factory) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-red-600" />
                <span>1. โรงงานต้นทาง (ซัพพลายเออร์)</span>
              </label>
              {suppliersList.length > 1 && onSelectSupplier && (
                <div className="flex items-center gap-1">
                  <select
                    value={activeSupplier.id}
                    onChange={(e) => onSelectSupplier(e.target.value)}
                    className="text-[11px] font-semibold bg-white border border-neutral-300 rounded px-2 py-0.5 text-neutral-800"
                  >
                    {suppliersList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs space-y-1.5">
              <div className="text-xs font-bold text-neutral-900 truncate">{activeSupplier.name}</div>
              <div className="text-[11px] text-neutral-600 flex items-start gap-1">
                <MapPin className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{originAddress}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px] text-neutral-500 font-mono">
                <span>พิกัด: {originLat.toFixed(4)}, {originLng.toFixed(4)}</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  ส่งฟรี {freeRadius} กม.
                </span>
              </div>
            </div>
          </div>

          {/* 2. Destination (Customer Site) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. หน้างานจัดส่ง / สถานที่ของลูกค้า</span>
              </label>

              <div className="flex items-center gap-1.5">
                {(destAddress || destMapsInput || destLat !== undefined) && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[10px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded shadow-2xs transition-colors flex items-center gap-1"
                    title="ล้างข้อมูลสถานที่ปลายทางทั้งหมด"
                  >
                    <span>✕ ล้างข้อมูล</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowManualCoords(!showManualCoords)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1 transition-colors ${
                    showManualCoords 
                      ? "bg-purple-100 text-purple-800 border border-purple-300" 
                      : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200"
                  }`}
                  title="ปรับแก้ค่าตัวเลขละติจูด/ลองจิจูดโดยตรง"
                >
                  <span>⚙️ ปรับพิกัด Lat,Lng</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="text-[10px] font-bold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 px-2 py-0.5 rounded shadow-2xs flex items-center gap-1"
                >
                  <span>📌 พื้นที่ยอดนิยม</span>
                  {showPresets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isGpsLoading}
                  className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shadow-2xs flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isGpsLoading ? "กำลังหา GPS..." : "ใช้ GPS"}</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-neutral-200 shadow-2xs space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={destAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="พิมพ์ชื่อสถานที่ / โครงการ / ถนน / จังหวัด เช่น พระราม 2, ชลบุรี, บางพลี..."
                  className="w-full text-xs font-semibold text-neutral-800 border border-neutral-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-red-500 pr-8"
                />
                {destAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestAddress("");
                      if (!destMapsInput) {
                        setDestLat(undefined);
                        setDestLng(undefined);
                      }
                      setLastUpdatedKey(Date.now());
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                    title="ล้างข้อความ"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={destMapsInput}
                  onChange={(e) => handleMapsInputChange(e.target.value)}
                  placeholder="วางลิงก์ Google Maps หรือพิกัด เช่น 13.6265, 100.3956 (อัปเดตทันที)"
                  className="w-full text-[11px] font-mono text-neutral-700 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:border-red-500 pr-8"
                />
                {destMapsInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestMapsInput("");
                      setDestLat(undefined);
                      setDestLng(undefined);
                      setLastUpdatedKey(Date.now());
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                    title="ล้างลิงก์หรือพิกัด"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Manual Lat & Lng direct decimal editors */}
              <AnimatePresence>
                {showManualCoords && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-purple-50/70 border border-purple-200/80 rounded-lg p-2 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-900">
                      <span>ระบุพิกัดตัวเลขโดยตรง (คำนวณระยะทาง & ค่าส่งอัปเดตทันที)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-600 block mb-0.5">Latitude (ละติจูด)</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={destLat ?? ""}
                          onChange={(e) => handleManualCoordChange("lat", e.target.value)}
                          placeholder="เช่น 13.6265"
                          className="w-full bg-white text-xs font-mono font-bold text-neutral-800 border border-neutral-300 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-600 block mb-0.5">Longitude (ลองจิจูด)</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={destLng ?? ""}
                          onChange={(e) => handleManualCoordChange("lng", e.target.value)}
                          placeholder="เช่น 100.3956"
                          className="w-full bg-white text-xs font-mono font-bold text-neutral-800 border border-neutral-300 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick matching chips if user typed keyword */}
              {destAddress && (
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  {PRESET_LOCATIONS.filter(p => 
                    p.name.toLowerCase().includes(destAddress.toLowerCase()) || 
                    p.province.toLowerCase().includes(destAddress.toLowerCase()) ||
                    p.keywords.some(k => k.toLowerCase().includes(destAddress.toLowerCase()))
                  ).slice(0, 3).map((match, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectPreset(match)}
                      className="text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1"
                    >
                      <span>📍 เลือก: {match.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {destLat !== undefined && destLng !== undefined && (
                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-1 border-t border-neutral-100">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    ✓ พิกัดปลายทาง: {destLat.toFixed(4)}, {destLng.toFixed(4)}
                  </span>
                  {parseNotice ? (
                    <span className="text-amber-700 font-bold animate-pulse">{parseNotice}</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">⚡ อัปเดตคำนวณเรียลไทม์แล้ว</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preset Locations Dropdown Area */}
        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2"
            >
              <div className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                <span>เลือกพื้นที่ก่อสร้างและฮับยอดนิยม (คลิกเพื่อคำนวณทันที)</span>
                <button
                  type="button"
                  onClick={() => setShowPresets(false)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-800"
                >
                  ปิด ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                {PRESET_LOCATIONS.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(loc)}
                    className="text-left bg-white hover:bg-red-50 hover:border-red-300 border border-neutral-200 p-2 rounded-lg text-xs transition-colors group"
                  >
                    <div className="font-bold text-neutral-800 group-hover:text-red-700 text-[11px] truncate">
                      {loc.name}
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">{loc.province}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Distance & Delivery Calculation Result Card / Empty Prompt */}
        {calcResult ? (
          <div className="space-y-3">
            <motion.div 
              key={lastUpdatedKey}
              initial={{ scale: 0.98, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                calcResult.isFreeDelivery 
                  ? "bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-white border-emerald-300/80 shadow-xs" 
                  : "bg-gradient-to-br from-amber-50/80 via-white to-neutral-50 border-amber-300/80 shadow-xs"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Distance and Free Condition status */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">ผลการคำนวณระยะทางทางถนน</span>
                    {calcResult.isFreeDelivery ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        อยู่ในเกณฑ์ส่งฟรี
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-amber-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        มีค่าขนส่งส่วนเกิน
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      อัปเดตเรียลไทม์
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 flex-wrap">
                    <motion.div 
                      key={`dist-${calcResult.distanceKm}`}
                      initial={{ scale: 1.08 }}
                      animate={{ scale: 1 }}
                      className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900"
                    >
                      {calcResult.distanceKm} <span className="text-base font-bold text-neutral-600">กม.</span>
                    </motion.div>
                    {calcResult.matchedTier ? (
                      <div className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300">
                        ช่วง {calcResult.matchedTier.minKm}–{calcResult.matchedTier.maxKm} กม. ({calcResult.matchedTier.price === 0 ? "ส่งฟรี ฿0" : `฿${fmt(calcResult.matchedTier.price)}`})
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-neutral-600">
                        (เงื่อนไข: ส่งฟรี {calcResult.freeRadiusKm} กม. แรก)
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-neutral-700 font-medium">
                    💡 <strong>คำอธิบาย:</strong> {calcResult.reason}
                  </p>
                </div>

                {/* Right: Net Delivery Fee & Action */}
                <motion.div 
                  key={`fee-${calcResult.deliveryFee}`}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col sm:items-end justify-center bg-white/90 p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs min-w-[220px]"
                >
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">ค่าจัดส่งสุทธิ</span>
                  <div className="flex items-baseline gap-1 my-0.5">
                    {calcResult.isFreeDelivery ? (
                      <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                        ฟรี ฿0
                      </span>
                    ) : (
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono text-red-600">
                        ฿{fmt(calcResult.deliveryFee)}
                      </span>
                    )}
                    {!calcResult.isFreeDelivery && <span className="text-xs font-bold text-neutral-600">บาท</span>}
                  </div>

                  <div className="text-[10px] text-neutral-500">
                    {calcResult.isFreeDelivery ? (
                      <span className="text-emerald-700 font-semibold">ประหยัดค่าขนส่งให้ลูกค้า</span>
                    ) : calcResult.matchedTier ? (
                      <span className="font-semibold text-neutral-700">ตามตารางช่วง {calcResult.matchedTier.minKm}–{calcResult.matchedTier.maxKm} กม.</span>
                    ) : (
                      <span>คิด {calcResult.ratePerKm} บาท/กม. (ส่วนเกิน {calcResult.excessDistanceKm} กม.)</span>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Quick Supplier Comparison Toggle */}
            {suppliersList.length > 1 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowSupplierComparison(!showSupplierComparison)}
                  className="text-xs font-bold text-neutral-700 hover:text-neutral-900 flex items-center gap-1.5 bg-neutral-100/80 hover:bg-neutral-200/80 px-3 py-1.5 rounded-lg border border-neutral-200 transition-colors"
                >
                  <Scale className="w-3.5 h-3.5 text-neutral-600" />
                  <span>เปรียบเทียบระยะทางและค่าส่งของทุกซัพพลายเออร์ ({suppliersList.length} เจ้า)</span>
                  {showSupplierComparison ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <AnimatePresence>
                  {showSupplierComparison && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2.5 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm"
                    >
                      <table className="w-full text-xs text-left">
                        <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                          <tr>
                            <th className="p-2.5">ซัพพลายเออร์ / โรงงาน</th>
                            <th className="p-2.5 text-center">ระยะทาง</th>
                            <th className="p-2.5 text-center">เงื่อนไขส่งฟรี</th>
                            <th className="p-2.5 text-right">ค่าขนส่งประเมิน</th>
                            <th className="p-2.5 text-center">การจัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {suppliersList.map((s) => {
                            const comp = calculateSupplierDelivery(s, destLat, destLng, destAddress);
                            const isSelected = s.id === activeSupplier.id;
                            if (!comp) return null;

                            return (
                              <tr key={s.id} className={isSelected ? "bg-red-50/40 font-semibold" : "hover:bg-neutral-50"}>
                                <td className="p-2.5">
                                  <div className="flex items-center gap-1.5">
                                    {isSelected && <span className="w-2 h-2 rounded-full bg-red-600"></span>}
                                    <span className="font-bold text-neutral-900">{s.name}</span>
                                  </div>
                                  <div className="text-[10px] text-neutral-500 truncate max-w-[200px]">
                                    {s.supplierLocation?.address || s.location}
                                  </div>
                                </td>
                                <td className="p-2.5 text-center font-mono font-bold">
                                  {comp.distanceKm} กม.
                                </td>
                                <td className="p-2.5 text-center text-[11px]">
                                  ฟรี {comp.freeRadiusKm} กม. แรก (เกิน {comp.ratePerKm} บ./กม.)
                                </td>
                                <td className="p-2.5 text-right font-mono font-bold">
                                  {comp.isFreeDelivery ? (
                                    <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded">
                                      ฟรี ฿0
                                    </span>
                                  ) : (
                                    <span className="text-red-600">฿{fmt(comp.deliveryFee)}</span>
                                  )}
                                </td>
                                <td className="p-2.5 text-center">
                                  {isSelected ? (
                                    <span className="text-[10px] text-neutral-500 font-bold bg-neutral-200 px-2 py-0.5 rounded">
                                      เลือกอยู่
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => onSelectSupplier && onSelectSupplier(s.id)}
                                      className="text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded"
                                    >
                                      สลับมาเจ้านี้
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-neutral-50/70 border border-dashed border-neutral-300/80 rounded-xl p-5 text-center space-y-2">
            <div className="mx-auto w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-700">
                ยังไม่ได้ระบุสถานที่จัดส่งปลายทาง
              </p>
              <p className="text-[11px] text-neutral-500 max-w-md mx-auto mt-0.5">
                พิมพ์ชื่อสถานที่, วางลิงก์ Google Maps / พิกัด หรือกดปุ่ม <strong>"ใช้ GPS"</strong> หรือ <strong>"📌 พื้นที่ยอดนิยม"</strong> ด้านบนเพื่อเริ่มคำนวณระยะทางและค่าจัดส่งอัตโนมัติ
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGpsLoading}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isGpsLoading ? "กำลังค้นหาตำแหน่ง..." : "ระบุด้วย GPS ปัจจุบัน"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPresets(true)}
                className="text-xs font-bold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>📌 เลือกจากพื้นที่ยอดนิยม</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
