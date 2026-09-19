import React, { useState } from "react";
import { CustomProduct } from "../types";
import { Plus, X, Package, Tag, Scale, ShieldCheck, Sparkles } from "lucide-react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: CustomProduct) => void;
  defaultCategory?: CustomProduct["category"];
}

export default function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
  defaultCategory = "other",
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [subLabel, setSubLabel] = useState("");
  const [category, setCategory] = useState<CustomProduct["category"]>(defaultCategory);
  const [unit, setUnit] = useState("บ./ชิ้น");
  const [cost, setCost] = useState<number | "">(0);
  const [markup, setMarkup] = useState<number | "">(0);
  const [price, setPrice] = useState<number | "">(0);
  const [weight, setWeight] = useState<number | "">(0);
  const [weightUnit, setWeightUnit] = useState("กก./ชิ้น");
  const [isTIS, setIsTIS] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle auto calculation between Cost, Markup and Price
  const handleCostChange = (val: number) => {
    setCost(val);
    const m = typeof markup === "number" ? markup : 0;
    setPrice(val + m);
  };

  const handleMarkupChange = (val: number) => {
    setMarkup(val);
    const c = typeof cost === "number" ? cost : 0;
    setPrice(c + val);
  };

  const handlePriceChange = (val: number) => {
    setPrice(val);
    const c = typeof cost === "number" ? cost : 0;
    setMarkup(Math.max(0, val - c));
  };

  // Category presets helper
  const handleCategoryChange = (newCat: CustomProduct["category"]) => {
    setCategory(newCat);
    if (newCat === "slabs") {
      setUnit("บ./ตร.ม.");
      setWeightUnit("กก./ตร.ม.");
    } else if (newCat === "hex_fence" || newCat === "i_piles" || newCat === "s_piles") {
      setUnit("บ./ม.");
      setWeightUnit("กก./ม.");
    } else if (newCat === "pipes") {
      setUnit("บ./ท่อน");
      setWeightUnit("กก./ท่อน");
    } else if (newCat === "basins") {
      setUnit("บ./ชิ้น");
      setWeightUnit("กก./ชิ้น");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("กรุณาระบุชื่อรายการสินค้า");
      return;
    }

    const c = typeof cost === "number" ? cost : 0;
    const p = typeof price === "number" ? price : 0;
    const w = typeof weight === "number" ? weight : 0;
    const m = typeof markup === "number" ? markup : Math.max(0, p - c);

    const newProduct: CustomProduct = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      subLabel: subLabel.trim() || undefined,
      category,
      unit,
      cost: c,
      price: p,
      markup: m,
      weight: w,
      weightUnit,
      isTIS,
      createdAt: new Date().toISOString(),
    };

    onAddProduct(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-[#C62828] to-red-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">เพิ่มรายการสินค้าใหม่</h3>
              <p className="text-xs text-red-100 font-medium">เพิ่มสินค้า ราคา และน้ำหนักเข้าสู่ระบบทุกโมดูล</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          {/* 1. Name & Sublabel */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
              <span>ชื่อสินค้า</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น แผ่นพื้นลวด 5 เส้น, เสาเข็ม I-12, ท่อระบายน้ำ 40 ซม. ชั้นพิเศษ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">หมวดหมู่สินค้า</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-800 focus:border-[#C62828] outline-none bg-white"
              >
                <option value="slabs">แผ่นพื้นคอนกรีตอัดแรง</option>
                <option value="hex_fence">เสาเข็มหกเหลี่ยม & เสารั้ว</option>
                <option value="i_piles">เสาเข็มรูปตัวไอ I-Shape</option>
                <option value="s_piles">เสาเข็มสี่เหลี่ยมตัน S-Shape</option>
                <option value="pipes">ท่อระบายน้ำ คสล.</option>
                <option value="basins">บ่อพัก คสล.</option>
                <option value="other">สินค้าสั่งทำ / กำหนดเองอื่นๆ</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">สเปก / รายละเอียดสั้น</label>
              <input
                type="text"
                value={subLabel}
                onChange={(e) => setSubLabel(e.target.value)}
                placeholder="เช่น หนา 5 ซม., ปากลิ้นราง, หน้ากว้าง 35"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-800 focus:border-[#C62828] outline-none"
              />
            </div>
          </div>

          {/* 2. Pricing & Cost Inputs */}
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-neutral-800 flex items-center gap-1.5">
                <Tag size={13} className="text-[#C62828]" />
                <span>กำหนดโครงสร้างราคา</span>
              </span>

              {/* Unit Selector */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-neutral-500 font-medium">หน่วยราคา:</span>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-2 py-0.5 rounded-lg border border-neutral-300 text-[11px] font-bold text-neutral-700 bg-white"
                >
                  <option value="บ./ตร.ม.">บ./ตร.ม.</option>
                  <option value="บ./ม.">บ./ม.</option>
                  <option value="บ./ท่อน">บ./ท่อน</option>
                  <option value="บ./ชิ้น">บ./ชิ้น</option>
                  <option value="บ./ชุด">บ./ชุด</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Cost */}
              <div>
                <label className="text-[11px] font-bold text-neutral-600">ต้นทุน (฿)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={cost === 0 ? "" : cost}
                  onChange={(e) => handleCostChange(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-300 text-xs font-bold font-mono text-neutral-800 bg-white focus:border-neutral-400 outline-none mt-1"
                />
              </div>

              {/* Markup */}
              <div>
                <label className="text-[11px] font-bold text-emerald-700">+ กำไร (฿)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={markup === 0 ? "" : markup}
                  onChange={(e) => handleMarkupChange(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-emerald-300 text-xs font-bold font-mono text-emerald-800 bg-emerald-50/40 focus:border-emerald-500 outline-none mt-1"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-[11px] font-bold text-[#C62828]">= ราคาขาย (฿)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price === 0 ? "" : price}
                  onChange={(e) => handlePriceChange(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-red-300 text-xs font-extrabold font-mono text-[#8B0000] bg-red-50/40 focus:border-[#C62828] outline-none mt-1"
                />
              </div>
            </div>
          </div>

          {/* 3. Weight Settings */}
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-neutral-800 flex items-center gap-1.5">
                <Scale size={13} className="text-neutral-700" />
                <span>พิกัดน้ำหนักต่อหน่วย (สำหรับคำนวณระวางรถ)</span>
              </span>

              {/* Weight Unit Selector */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-neutral-500 font-medium">หน่วย:</span>
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="px-2 py-0.5 rounded-lg border border-neutral-300 text-[11px] font-bold text-neutral-700 bg-white"
                >
                  <option value="กก./ตร.ม.">กก./ตร.ม.</option>
                  <option value="กก./ม.">กก./ม.</option>
                  <option value="กก./ท่อน">กก./ท่อน</option>
                  <option value="กก./ชิ้น">กก./ชิ้น</option>
                  <option value="กก./ชุด">กก./ชุด</option>
                </select>
              </div>
            </div>

            <div>
              <input
                type="number"
                min="0"
                step="any"
                value={weight === 0 ? "" : weight}
                onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="ระบุน้ำหนัก เช่น 42.0 (กก.)"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-bold font-mono text-neutral-800 bg-white focus:border-neutral-500 outline-none"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                * ค่านี้จะถูกนำไปใช้ในหน้าคำนวณน้ำหนัก และการจัดสรรรถ 6 ล้อ / 10 ล้อ / เทเลอร์ / พ่วง อัตโนมัติ
              </p>
            </div>
          </div>

          {/* 4. TIS Standard Checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={isTIS}
              onChange={(e) => setIsTIS(e.target.checked)}
              className="w-4 h-4 text-[#C62828] rounded border-neutral-300 focus:ring-red-500 cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className={isTIS ? "text-[#C62828]" : "text-neutral-400"} />
              <span className="text-xs font-bold text-neutral-800">เป็นสินค้ามาตรฐาน มอก. (สเปกโครงการ)</span>
            </div>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus size={14} />
              <span>บันทึกสินค้าใหม่</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
