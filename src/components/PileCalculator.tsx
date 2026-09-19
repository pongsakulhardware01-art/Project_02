import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { AppSettings, WeightItem } from "../types";
import { fmt, roundToBeautifulPrice } from "../utils";
import PileVisualizer from "./PileVisualizer";
import SupplierQuickSelector from "./SupplierQuickSelector";
import { Hammer, Copy, Check, Truck, Sparkles, CheckCircle2 } from "lucide-react";

interface PileCalculatorProps {
  settings: AppSettings;
  weightItems?: WeightItem[];
  setWeightItems?: Dispatch<SetStateAction<WeightItem[]>>;
  onNavigateToWeight?: () => void;
  onSelectSupplier?: (supplierId: string) => void;
  onNavigateToSettings?: () => void;
}

export default function PileCalculator({ 
  settings, 
  weightItems,
  setWeightItems,
  onNavigateToWeight,
  onSelectSupplier, 
  onNavigateToSettings 
}: PileCalculatorProps) {
  // Auto round prices state (sharing via localStorage)
  const [autoRoundPrice, setAutoRoundPrice] = useState<boolean>(() => {
    return localStorage.getItem("pongsakulAutoRoundPrice") === "true";
  });

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

  const [copiedPrice, setCopiedPrice] = useState(false);
  const [addedCargoNotification, setAddedCargoNotification] = useState<string | null>(null);

  const [pileType, setPileType] = useState<string>("hex");
  const [pileConnection, setPileConnection] = useState<string>("single");
  const [pileStandard, setPileStandard] = useState<string>("no_tis");
  const [pileLength, setPileLength] = useState<number | "">(2.0);
  const [pileCount, setPileCount] = useState<number | "">(10);

  const isCustomPile = pileType.startsWith("custom_");
  const customPiles = (settings.customProducts || []).filter(
    (cp) => (cp.category === "i_piles" || cp.category === "s_piles" || cp.category === "hex_fence") && !(settings.deletedItemIds || []).includes(cp.id)
  );
  const selectedCustomPile = customPiles.find((cp) => cp.id === pileType);

  const isI_Shape = pileType === "i18" || pileType === "i22" || pileType === "i26" || pileType === "i30" || pileType === "i35" || pileType === "i40";
  const isS_Shape = pileType === "s18" || pileType === "s22" || pileType === "s26" || pileType === "s30" || pileType === "s35" || pileType === "s40";
  const hasConnectionOption = isI_Shape || isS_Shape;
  const hasStandardOption = pileType === "i18" || pileType === "i22" || pileType === "i26" || pileType === "i30" || pileType === "i35" || pileType === "i40";
  
  const isTis = hasStandardOption && pileStandard === "tis";
  const isJoint = hasConnectionOption && pileConnection === "joint";

  const calcPileLength = pileLength === "" ? 0 : pileLength;
  const calcPileCount = pileCount === "" ? 0 : pileCount;

  // Price & weight per meter deduction
  let pricePerMeter = 0;
  let weightPerMeter = 0;

  if (selectedCustomPile) {
    pricePerMeter = selectedCustomPile.price;
    weightPerMeter = selectedCustomPile.weight;
  } else if (pileType === "i15") {
    pricePerMeter = settings.prices.i15Price;
    weightPerMeter = settings.weights.i15;
  } else if (pileType === "hex") {
    pricePerMeter = settings.prices.hexPilePrice;
    weightPerMeter = settings.weights.hex;
  } else if (pileType === "fence3") {
    pricePerMeter = settings.prices.fence3Price;
    weightPerMeter = settings.weights.fence3;
  } else if (pileType === "fence4") {
    pricePerMeter = settings.prices.fence4Price;
    weightPerMeter = settings.weights.fence4;
  } else if (pileType === "i18") {
    weightPerMeter = isTis ? settings.weights.i18_tis : settings.weights.i18_no_tis;
    if (isJoint) {
      pricePerMeter = isTis ? settings.prices.i18TISJointPrice : settings.prices.i18JointPrice;
    } else {
      pricePerMeter = isTis ? settings.prices.i18TISPrice : settings.prices.i18NoTISPrice;
    }
  } else if (pileType === "i22") {
    weightPerMeter = isTis ? settings.weights.i22_tis : settings.weights.i22_no_tis;
    if (isJoint) {
      pricePerMeter = isTis ? settings.prices.i22TISJointPrice : settings.prices.i22JointPrice;
    } else {
      pricePerMeter = isTis ? settings.prices.i22TISPrice : settings.prices.i22NoTISPrice;
    }
  } else if (pileType === "i26") {
    weightPerMeter = isTis ? settings.weights.i26_tis : settings.weights.i26_no_tis;
    if (isJoint) {
      pricePerMeter = isTis ? settings.prices.i26TISJointPrice : settings.prices.i26NoTISJointPrice;
    } else {
      pricePerMeter = isTis ? settings.prices.i26TISPrice : settings.prices.i26NoTISPrice;
    }
  } else if (pileType === "i30") {
    weightPerMeter = isTis ? settings.weights.i30_tis : settings.weights.i30_no_tis;
    if (isJoint) {
      pricePerMeter = isTis ? settings.prices.i30TISJointPrice : settings.prices.i30NoTISJointPrice;
    } else {
      pricePerMeter = isTis ? settings.prices.i30TISPrice : settings.prices.i30NoTISPrice;
    }
  } else if (pileType === "i35") {
    weightPerMeter = settings.weights.i35;
    pricePerMeter = isJoint ? settings.prices.i35TISJointPrice : settings.prices.i35TISPrice;
  } else if (pileType === "i40") {
    weightPerMeter = settings.weights.i40;
    pricePerMeter = isJoint ? settings.prices.i40TISJointPrice : settings.prices.i40TISPrice;
  } else if (pileType === "s18") {
    weightPerMeter = settings.weights.s18;
    pricePerMeter = isJoint ? settings.prices.s18JointPrice : settings.prices.s18Price;
  } else if (pileType === "s22") {
    weightPerMeter = settings.weights.s22;
    pricePerMeter = isJoint ? settings.prices.s22JointPrice : settings.prices.s22Price;
  } else if (pileType === "s26") {
    weightPerMeter = settings.weights.s26;
    pricePerMeter = isJoint ? settings.prices.s26JointPrice : settings.prices.s26Price;
  } else if (pileType === "s30") {
    weightPerMeter = settings.weights.s30;
    pricePerMeter = isJoint ? settings.prices.s30JointPrice : settings.prices.s30Price;
  } else if (pileType === "s35") {
    weightPerMeter = settings.weights.s35;
    pricePerMeter = isJoint ? settings.prices.s35JointPrice : settings.prices.s35Price;
  } else if (pileType === "s40") {
    weightPerMeter = settings.weights.s40;
    pricePerMeter = isJoint ? settings.prices.s40JointPrice : settings.prices.s40Price;
  }

  const rawPricePerPile = pricePerMeter * calcPileLength;
  const rawTotalPrice = rawPricePerPile * calcPileCount;
  const finalPricePerPile = autoRoundPrice ? roundToBeautifulPrice(rawPricePerPile) : rawPricePerPile;
  const totalPrice = autoRoundPrice ? roundToBeautifulPrice(rawTotalPrice) : rawTotalPrice;
  const totalWeight = weightPerMeter * calcPileLength * calcPileCount;

  const handleCopyPrice = (val: number) => {
    navigator.clipboard.writeText(String(val));
    setCopiedPrice(true);
    setTimeout(() => setCopiedPrice(false), 1200);
  };

  const handleAddToCargo = () => {
    if (!setWeightItems) return;
    if (calcPileCount <= 0 || calcPileLength <= 0) return;

    let pileNameTh = "เสาเข็มไอ I-18";
    if (selectedCustomPile) {
      pileNameTh = `⭐ ${selectedCustomPile.name}`;
    } else if (pileType === "hex") {
      pileNameTh = "เสาเข็มหกเหลี่ยมกลวง";
    } else if (pileType === "fence3") {
      pileNameTh = "เสารั้วลวดหนาม 3\"";
    } else if (pileType === "fence4") {
      pileNameTh = "เสารั้วลวดหนาม 4\"";
    } else if (isS_Shape) {
      pileNameTh = `เสาสี่เหลี่ยมตัน S-${pileType.replace("s", "")}`;
    } else if (isI_Shape) {
      pileNameTh = `เสาเข็มไอ I-${pileType.replace("i", "")} ${isTis ? "มอก." : ""}`;
    }

    const newCargoItem: WeightItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: pileType,
      count: calcPileCount,
      length: calcPileLength,
      unitWeight: weightPerMeter
    };

    setWeightItems((prev) => [...prev, newCargoItem]);
    setAddedCargoNotification(`เพิ่ม "${pileNameTh}" (${calcPileCount} ต้น) ไประวางรถเรียบร้อยแล้ว!`);
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

      {/* Dynamic topbar with auto-round toggler */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-[#C62828] rounded-xl">
            <Hammer size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-800">
              คำนวณราคาเสาเข็มคอนกรีตอัดแรง & เสารั้ว 🏗️
            </h3>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              เสาเข็มไอ (I-Pile), เสาสี่เหลี่ยมตัน (S-Pile), เสาหกเหลี่ยม และเสารั้วลวดหนาม
            </p>
          </div>
        </div>

        <button
          onClick={toggleAutoRoundPrice}
          className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold border transition duration-150 shadow-2xs cursor-pointer ${
            autoRoundPrice
              ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-600"
              : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600"
          }`}
          title="ปรับราคาสินค้าขึ้นมาลงท้ายในหลัก 5 หรือ 0 เพื่อเอกสารเสนอราคาที่สวยงาม"
        >
          <Sparkles size={13} className={autoRoundPrice ? "animate-spin" : "text-amber-500"} />
          <span>ปรับราคาสวยงาม (ลงท้าย 5/0): {autoRoundPrice ? "เปิดใช้งาน ✅" : "ปิดอยู่ ❌"}</span>
        </button>
      </div>

      {addedCargoNotification && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{addedCargoNotification}</span>
          </div>
          {onNavigateToWeight && (
            <button
              onClick={onNavigateToWeight}
              className="text-emerald-700 hover:text-emerald-900 underline font-bold cursor-pointer shrink-0"
            >
              ไปหน้าระวางรถขนส่ง →
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Input controls */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-xs border border-neutral-200/80 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-neutral-100">
            <div className="p-2 bg-red-50 text-[#C62828] rounded-xl">
              <Hammer size={18} />
            </div>
            <h3 className="font-bold text-neutral-800 text-lg">สเปคเสาเข็ม / เสารั้ว</h3>
          </div>

          <div className="space-y-4">
            {/* Pile Type option list */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-700">ชนิดและขนาดเสาเข็ม</label>
              <select
                value={pileType}
                onChange={(e) => setPileType(e.target.value)}
                className="w-full p-3 bg-neutral-50 hover:bg-white focus:bg-white transition border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
              >
                {customPiles.length > 0 && (
                  <optgroup label="⭐ สินค้ากำหนดเอง (Custom Products)">
                    {customPiles.map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.name} {cp.subLabel ? `(${cp.subLabel})` : ""} - ฿{fmt(cp.price)}/ม. ({cp.weight} {cp.weightUnit})
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="เสาเข็มไอ (I-Shape Pile)">
                  {!settings.deletedItemIds?.includes("i15Price") && <option value="i15">เสาเข็มไอ I-15</option>}
                  {(!settings.deletedItemIds?.includes("i18NoTISPrice") || !settings.deletedItemIds?.includes("i18TISPrice")) && <option value="i18">เสาเข็มไอ I-18</option>}
                  {(!settings.deletedItemIds?.includes("i22NoTISPrice") || !settings.deletedItemIds?.includes("i22TISPrice")) && <option value="i22">เสาเข็มไอ I-22</option>}
                  {(!settings.deletedItemIds?.includes("i26NoTISPrice") || !settings.deletedItemIds?.includes("i26TISPrice")) && <option value="i26">เสาเข็มไอ I-26</option>}
                  {(!settings.deletedItemIds?.includes("i30NoTISPrice") || !settings.deletedItemIds?.includes("i30TISPrice")) && <option value="i30">เสาเข็มไอ I-30</option>}
                  {!settings.deletedItemIds?.includes("i35TISPrice") && <option value="i35">เสาเข็มไอ I-35</option>}
                  {!settings.deletedItemIds?.includes("i40TISPrice") && <option value="i40">เสาเข็มไอ I-40</option>}
                </optgroup>
                <optgroup label="เสาสี่เหลี่ยมตัน (Solid Square Pile) - ใหม่ ✨">
                  {!settings.deletedItemIds?.includes("s18Price") && <option value="s18">เสาสี่เหลี่ยมตัน S-18</option>}
                  {!settings.deletedItemIds?.includes("s22Price") && <option value="s22">เสาสี่เหลี่ยมตัน S-22</option>}
                  {!settings.deletedItemIds?.includes("s26Price") && <option value="s26">เสาสี่เหลี่ยมตัน S-26</option>}
                  {!settings.deletedItemIds?.includes("s30Price") && <option value="s30">เสาสี่เหลี่ยมตัน S-30</option>}
                  {!settings.deletedItemIds?.includes("s35Price") && <option value="s35">เสาสี่เหลี่ยมตัน S-35</option>}
                  {!settings.deletedItemIds?.includes("s40Price") && <option value="s40">เสาสี่เหลี่ยมตัน S-40</option>}
                </optgroup>
                <optgroup label="เสาเข็มประเภทอื่นๆ & เสารั้ว">
                  {!settings.deletedItemIds?.includes("hexPilePrice") && <option value="hex">เสาเข็ม หกเหลี่ยมกลวง</option>}
                  {!settings.deletedItemIds?.includes("fence3Price") && <option value="fence3">เสารั้วลวดหนาม 3"</option>}
                  {!settings.deletedItemIds?.includes("fence4Price") && <option value="fence4">เสารั้วลวดหนาม 4"</option>}
                </optgroup>
              </select>
            </div>

            {/* Connection option for I-shapes & S-piles */}
            {hasConnectionOption && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-700">ลักษณะท่อนเสาเข็ม</label>
                <select
                  value={pileConnection}
                  onChange={(e) => setPileConnection(e.target.value)}
                  className="w-full p-3 bg-neutral-50 hover:bg-white focus:bg-white transition border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                >
                  <option value="single">ท่อนเดียว (Single Pile)</option>
                  <option value="joint">ท่อนต่อเชื่อมหูสลัก (Joint Pile)</option>
                </select>
              </div>
            )}

            {/* Standard specifications TIS / Normal */}
            {hasStandardOption && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-700">มาตรฐานการรองรับ</label>
                <select
                  value={pileStandard}
                  onChange={(e) => setPileStandard(e.target.value)}
                  className="w-full p-3 bg-neutral-50 hover:bg-white focus:bg-white transition border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                >
                  <option value="no_tis">เกรดธรรมดาทั่วไป (ไม่มีสัญลักษณ์ มอก.)</option>
                  <option value="tis">เกรดผ่านรับรองมาตรฐาน มอก. (TIS Standard)</option>
                </select>
              </div>
            )}

            {/* Pole length input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-700 flex justify-between">
                <span>ความยาวเสาต่อท่อน (เมตร)</span>
                <span className="text-xs text-neutral-500 font-mono">ใส่แบบทศนิยมได้</span>
              </label>
              <input
                type="number"
                value={pileLength}
                onChange={(e) => {
                  const val = e.target.value;
                  setPileLength(val === "" ? "" : parseFloat(val));
                }}
                step="0.1"
                className="w-full p-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                placeholder="เช่น 2.0"
              />
            </div>

            {/* Pile count */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-700">จำนวนเสาเข็ม/เสารั้วที่สั่งซื้อ (ต้น)</label>
              <input
                type="number"
                value={pileCount}
                onChange={(e) => {
                  const val = e.target.value;
                  setPileCount(val === "" ? "" : parseInt(val));
                }}
                step="1"
                className="w-full p-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                placeholder="เช่น 10"
              />
            </div>
          </div>
        </div>

        {/* Dynamic visual representation */}
        <PileVisualizer pileType={pileType} isJoint={isJoint} isTis={isTis} length={calcPileLength} />
      </div>

      {/* Summary box outputs */}
      <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
        <div className="bg-gradient-to-br from-neutral-900 via-[#991B1B] to-[#7F1D1D] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between h-full min-h-[350px] border border-neutral-800">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-white/15 text-amber-200 py-1 px-3 rounded-full uppercase tracking-wider">
                ผลการประมาณราคาเสาเข็ม
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
                (รายละเอียด: {calcPileCount} ต้น ท่อนละ {calcPileLength.toFixed(2)} เมตร)
              </span>
            </div>
          </div>

          <div className="border-t border-white/15 pt-5 mt-6 space-y-3 font-light text-neutral-200 text-sm">
            <div className="flex justify-between items-center">
              <span>อัตราค่าเสาเฉลี่ย:</span>
              <strong className="text-white font-semibold font-mono">฿{fmt(pricePerMeter)} / เมตร</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>เกรดมาตรฐานรับรอง:</span>
              <span className="text-white font-bold bg-white/10 px-2.5 py-0.5 rounded text-xs">
                {isTis ? "มอก. (TIS Approved)" : "ธรรมดาทั่วไป"}
              </span>
            </div>
            {hasConnectionOption && (
              <div className="flex justify-between items-center">
                <span>รูปแบบโครงสร้างการเชื่อม:</span>
                <strong className="text-white font-medium">{isJoint ? "ใช้แผ่นเหล็กเชื่อมต่อหัว" : "ท่อนชิ้นเดียวยาวตลอด"}</strong>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-white/10 pt-2">
              <span>ราคาต่อหนึ่งต้นเสา:</span>
              <strong className="text-white font-semibold font-mono text-base">฿{fmt(finalPricePerPile)}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>ประมาณการน้ำหนักสุทธิ:</span>
              <span className="text-amber-300 font-bold font-mono text-base">{fmt(totalWeight)} กก.</span>
            </div>
          </div>

          {/* Add to Cargo / Logistics Dispatch Button */}
          {setWeightItems && (
            <button
              onClick={handleAddToCargo}
              disabled={calcPileCount <= 0 || calcPileLength <= 0}
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
