import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { AppSettings, WeightItem } from "../types";
import { fmt, roundToBeautifulPrice } from "../utils";
import SupplierQuickSelector from "./SupplierQuickSelector";
import { Hammer, Sparkles, Copy, Check, Truck, CheckCircle2 } from "lucide-react";

interface HollowCoreCalculatorProps {
  settings: AppSettings;
  weightItems?: WeightItem[];
  setWeightItems?: Dispatch<SetStateAction<WeightItem[]>>;
  onNavigateToWeight?: () => void;
  onSelectSupplier?: (supplierId: string) => void;
  onNavigateToSettings?: () => void;
}

export default function HollowCoreCalculator({ 
  settings, 
  weightItems,
  setWeightItems,
  onNavigateToWeight,
  onSelectSupplier, 
  onNavigateToSettings 
}: HollowCoreCalculatorProps) {
  // Auto round prices state (sharing via localStorage)
  const [autoRoundPrice, setAutoRoundPrice] = useState<boolean>(() => {
    return localStorage.getItem("pongsakulAutoRoundPrice") === "true";
  });

  const [copiedPrice, setCopiedPrice] = useState(false);
  const [addedCargoNotification, setAddedCargoNotification] = useState<string | null>(null);

  const toggleAutoRoundPrice = () => {
    const newVal = !autoRoundPrice;
    setAutoRoundPrice(newVal);
    localStorage.setItem("pongsakulAutoRoundPrice", String(newVal));
    window.dispatchEvent(new Event("storage_round_price"));
  };

  useEffect(() => {
    const syncVal = () => {
      setAutoRoundPrice(localStorage.getItem("pongsakulAutoRoundPrice") === "true");
    };
    window.addEventListener("storage_round_price", syncVal);
    return () => window.removeEventListener("storage_round_price", syncVal);
  }, []);

  const [hcWidth, setHcWidth] = useState<number | "">(0.35);
  const [hcLength, setHcLength] = useState<number | "">(4.0);
  const [hcCount, setHcCount] = useState<number | "">(1);
  const [hcPricePerSqm, setHcPricePerSqm] = useState<string>("");
  const [hcVatMode, setHcVatMode] = useState<string>("no");
  const [hcVatPercent, setHcVatPercent] = useState<number | "">(7.0);
  const [hcAdditionalPrice, setHcAdditionalPrice] = useState<number | "">(0);

  const calcHcWidth = hcWidth === "" ? 0 : hcWidth;
  const calcHcLength = hcLength === "" ? 0 : hcLength;
  const calcHcCount = hcCount === "" ? 1 : hcCount;
  const calcHcAdditionalPrice = hcAdditionalPrice === "" ? 0 : hcAdditionalPrice;
  const calcHcVatPercent = hcVatPercent === "" ? 0 : hcVatPercent;

  const selectedPricePerSqm = hcPricePerSqm === "" ? settings.prices.hcPriceSqm : parseFloat(hcPricePerSqm) || 0;
  const sqm = calcHcWidth * calcHcLength;
  const priceBeforeVatPerPiece = selectedPricePerSqm * sqm;
  
  const isVat = hcVatMode === "yes";
  const vatAmountPerPiece = isVat ? priceBeforeVatPerPiece * (calcHcVatPercent / 100) : 0;
  const rawPricePerPiece = priceBeforeVatPerPiece + vatAmountPerPiece + calcHcAdditionalPrice;
  const finalPricePerPiece = autoRoundPrice ? roundToBeautifulPrice(rawPricePerPiece) : rawPricePerPiece;

  const rawTotalPrice = finalPricePerPiece * calcHcCount;
  const totalPrice = autoRoundPrice ? roundToBeautifulPrice(rawTotalPrice) : rawTotalPrice;

  const weightPerMeter = settings.weights.slab * 2 * (calcHcWidth / 0.35);
  const totalWeight = weightPerMeter * calcHcLength * calcHcCount;

  // Determine standard number of tube holes for SVG visualization based on width
  let holesCount = 4;
  if (calcHcWidth <= 0.45) holesCount = 3;
  else if (calcHcWidth <= 0.7) holesCount = 5;
  else holesCount = 8;

  const handleCopyPrice = (val: number) => {
    navigator.clipboard.writeText(String(val));
    setCopiedPrice(true);
    setTimeout(() => setCopiedPrice(false), 1200);
  };

  const handleAddToCargo = () => {
    if (!setWeightItems) return;
    if (calcHcCount <= 0 || calcHcLength <= 0) return;

    const newCargoItem: WeightItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: "hollow_core",
      count: calcHcCount,
      length: calcHcLength,
      unitWeight: weightPerMeter
    };

    setWeightItems((prev) => [...prev, newCargoItem]);
    setAddedCargoNotification(`เพิ่ม "แผ่นพื้นกลวง HC กว้าง ${calcHcWidth}ม. ยาว ${calcHcLength}ม." (${calcHcCount} แผ่น) ไประวางรถเรียบร้อยแล้ว!`);
    setTimeout(() => setAddedCargoNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Active Supplier Quick Selector Bar */}
      <SupplierQuickSelector
        settings={settings}
        onSelectSupplier={onSelectSupplier}
        onNavigateToSettings={onNavigateToSettings}
      />

      {/* Options dashboard panel */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-150 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-150 text-[#C62828] rounded-xl">
            <Hammer size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-neutral-800 text-sm md:text-base">คำนวณราคาแผ่นพื้นกลวงพิกัดพิเศษ (Hollow Core) 🕳️</h3>
            <p className="text-xs text-neutral-500 font-light">ระบบเลือกหน้ายางและบวกรวมภาษีและค่าดำเนินการอัตราร่วม</p>
          </div>
        </div>

        {/* Beautiful Auto-Round Price Toggle Button */}
        <button
          onClick={toggleAutoRoundPrice}
          className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold border transition duration-150 shadow-sm cursor-pointer w-full sm:w-auto ${
            autoRoundPrice
              ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-600"
              : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600"
          }`}
          title="ปันเศษราคาขึ้นให้ลงท้ายด้วย 5 หรือ 0 เพื่อเสนอราคาพิกัดรวมสวยๆ ให้ลูกค้า"
        >
          <Sparkles size={14} className={autoRoundPrice ? "animate-spin text-white" : "text-amber-500"} />
          <span>🪄 ปรับราคาสวยอัตโนมัติ (ปัดขึ้นลงท้าย 5/0): {autoRoundPrice ? "เปิดใช้งาน ✅" : "ปิดอยู่ ❌"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Inputs side */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-neutral-100">
            <div className="p-2 bg-red-50 text-[#C62828] rounded-lg">
              <Hammer size={18} />
            </div>
            <h3 className="font-semibold text-neutral-800 text-lg">สเปคแผ่นพื้นกลวง (Hollow Core)</h3>
          </div>

          <div className="space-y-4">
            {/* Width Selector / Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-700 flex justify-between">
                <span>ความกว้างของแผ่นพื้นกลวง (เมตร)</span>
                <span className="text-xs text-[#C62828] font-bold">ควรอิงตามจริง: 0.35, 0.60, 1.20</span>
              </label>
              <input
                type="number"
                value={hcWidth}
                onChange={(e) => {
                  const val = e.target.value;
                  setHcWidth(val === "" ? "" : parseFloat(val));
                }}
                step="0.01"
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                placeholder="ระบุความกว้าง เช่น 0.35, 0.60, 1.20"
              />
            </div>

            {/* Length and Quantity parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-700 flex justify-between">
                  <span>ความยาวแผ่น (เมตร)</span>
                  <span className="text-xs text-neutral-500 font-mono">ใส่แบบทศนิยมได้</span>
                </label>
                <input
                  type="number"
                  value={hcLength}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHcLength(val === "" ? "" : parseFloat(val));
                  }}
                  step="0.1"
                  className="w-full p-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                  placeholder="เช่น 4.0"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-700">จำนวนแผ่นที่สั่งซื้อ (แผ่น)</label>
                <input
                  type="number"
                  value={hcCount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHcCount(val === "" ? "" : parseInt(val));
                  }}
                  step="1"
                  className="w-full p-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                  placeholder="เช่น 1"
                />
              </div>
            </div>

            {/* Custom pricing */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-700 flex justify-between">
                <span>ราคาสัญญาตั้งไว้ (บาท / ตร.ม.)</span>
                <span className="text-xs text-neutral-500 font-medium">เว้นว่างไว้จะอิงจากราคากลาง ฿{settings.prices.hcPriceSqm}</span>
              </label>
              <input
                type="number"
                value={hcPricePerSqm}
                onChange={(e) => setHcPricePerSqm(e.target.value)}
                className="w-full p-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                placeholder={`ราคากลางบิลหลัก: ${settings.prices.hcPriceSqm} บาท/ตร.ม.`}
              />
            </div>

            {/* Additional expense */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-700">ค่าพาหนะขนส่ง หรือค่าดำเนินการบวกเพิ่มต่อแผ่น (บาท)</label>
              <input
                type="number"
                value={hcAdditionalPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  setHcAdditionalPrice(val === "" ? "" : parseFloat(val));
                }}
                className="w-full p-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                placeholder="เช่น 0 หรือ 500"
              />
            </div>

            {/* Tax Settings row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-700">ภาษีมูลค่าเพิ่ม (VAT)</label>
                <select
                  value={hcVatMode}
                  onChange={(e) => setHcVatMode(e.target.value)}
                  className="w-full p-3 bg-neutral-50 hover:bg-white focus:bg-white transition border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                >
                  <option value="no">ไม่รวมภาษีมูลค่าเพิ่ม</option>
                  <option value="yes">รวมภาษีมูลค่าเพิ่ม (VAT)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-700">สัดส่วนอัตรา (%)</label>
                <input
                  type="number"
                  disabled={hcVatMode !== "yes"}
                  value={hcVatPercent}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHcVatPercent(val === "" ? "" : parseFloat(val));
                  }}
                  className="w-full p-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828] disabled:bg-neutral-100 disabled:text-neutral-400"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Hollow Core Profile Illustration SVG */}
        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/70 flex flex-col items-center justify-center gap-2">
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">แผ่นพื้นกลวง ภาคตัดขวางเชิงภาพ</span>
          <svg width="220" height="70" viewBox="0 0 220 70">
            {/* Outer slab box */}
            <rect x="10" y="15" width="200" height="30" rx="3" fill="#D4D4D8" stroke="#71717A" strokeWidth="2.5" />
            {/* Draw hollow tubes holes */}
            {Array.from({ length: holesCount }).map((_, idx) => {
              const gapWidth = 200 / (holesCount + 1);
              const cx = 10 + gapWidth * (idx + 1);
              return (
                <circle key={idx} cx={cx} cy="30" r="8" fill="#F4F4F5" stroke="#A1A1AA" strokeWidth="1.5" />
              );
            })}
            {/* Bottom tension wires strands */}
            {Array.from({ length: holesCount + 1 }).map((_, idx) => {
              const gapWidth = 200 / (holesCount + 2);
              const cx = 10 + gapWidth * (idx + 1);
              return (
                <circle key={idx} cx={cx} cy="41" r="1.5" fill="#F59E0B" />
              );
            })}
            <text x="110" y="60" fill="#71717A" fontSize="9" textAnchor="middle" fontFamily="Kanit">
              กว้าง {calcHcWidth} ม. | ช่องกลวงระบายอากาศ {holesCount} ช่อง
            </text>
          </svg>
        </div>
      </div>

      {/* Result summary side */}
      <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
        <div className="bg-gradient-to-br from-neutral-900 via-[#991B1B] to-[#7F1D1D] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between h-full min-h-[350px] border border-neutral-800">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-white/15 text-amber-200 py-1 px-3 rounded-full uppercase tracking-wider">
                ผลการประมาณราคาหล่อเสร็จแผ่นพื้นกลวง
              </span>
              {autoRoundPrice && (
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md font-mono">
                  ปัดเศษ 5/0
                </span>
              )}
            </div>

            <div className="mt-6">
              <span className="text-sm opacity-80 block font-medium">ยอดราคารวมสุทธิ</span>
              <div className="flex items-center gap-3">
                <span className="text-4xl md:text-5xl font-black tracking-tight font-mono">
                  ฿{fmt(totalPrice)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyPrice(totalPrice)}
                  className={`p-2 rounded-xl transition duration-150 flex items-center justify-center cursor-pointer ${
                    copiedPrice
                      ? "bg-white/25 text-emerald-300 scale-105"
                      : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
                  }`}
                  title={`คัดลอกราคารวม (฿${fmt(totalPrice)})`}
                >
                  {copiedPrice ? <Check size={16} className="stroke-[3]" /> : <Copy size={16} />}
                </button>
              </div>
              <span className="text-xs opacity-75 block mt-2 font-light">
                (รายละเอียด: {calcHcCount} แผ่น รวมพื้นที่: {fmt(sqm * calcHcCount)} ตร.ม.)
              </span>
            </div>
          </div>

          <div className="border-t border-white/15 pt-5 mt-6 space-y-3 font-light text-neutral-200 text-sm">
            <div className="flex justify-between items-center">
              <span>ราคากลาง (ต่อ ตร.ม.):</span>
              <strong className="text-white font-semibold font-mono">฿{fmt(selectedPricePerSqm)} / ตร.ม.</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>ราคาต่อหนึ่งแผ่น:</span>
              <strong className="text-white font-semibold font-mono">฿{fmt(finalPricePerPiece)}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>อัตราภาษีมูลค่าเพิ่ม:</span>
              <span className="text-white font-medium">
                {isVat ? `฿${fmt(vatAmountPerPiece * calcHcCount)} (VAT ${hcVatPercent}%)` : "ไม่มีแวทสินค้า"}
              </span>
            </div>
            {calcHcAdditionalPrice > 0 && (
              <div className="flex justify-between items-center">
                <span>ค่าดำเนินการขนส่งบวกเพิ่ม:</span>
                <strong className="text-white font-semibold font-mono">฿{fmt(calcHcAdditionalPrice * calcHcCount)}</strong>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-white/10 pt-2">
              <span>น้ำหนักรวมทั้งหมด:</span>
              <span className="text-amber-300 font-bold font-mono text-base">{fmt(totalWeight)} กก.</span>
            </div>
          </div>

          {/* Add to Cargo / Logistics Dispatch Button */}
          {setWeightItems && (
            <button
              onClick={handleAddToCargo}
              disabled={calcHcCount <= 0 || calcHcLength <= 0}
              className="mt-6 w-full py-3 px-4 bg-white/10 hover:bg-white/20 active:scale-98 text-white rounded-xl font-bold text-xs md:text-sm transition flex items-center justify-center gap-2 border border-white/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Truck size={16} className="text-amber-300" />
              <span>ส่งข้อมูลไปยังการจัดระวางรถขนส่ง 🚚</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
