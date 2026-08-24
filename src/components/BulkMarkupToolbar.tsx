import React, { useState } from "react";
import { Prices } from "../types";
import { Sparkles, Percent, DollarSign, ArrowRight, Check, RefreshCw } from "lucide-react";

interface BulkMarkupToolbarProps {
  costs: Prices;
  prices: Prices;
  onApplyBulkMarkup: (category: string, mode: "fixed" | "percent", value: number) => void;
}

export function BulkMarkupToolbar({ costs, prices, onApplyBulkMarkup }: BulkMarkupToolbarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [markupMode, setMarkupMode] = useState<"fixed" | "percent">("fixed");
  const [markupValue, setMarkupValue] = useState<number>(20);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  const handleApply = () => {
    if (markupValue < 0) return;
    onApplyBulkMarkup(selectedCategory, markupMode, markupValue);
    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 2500);
  };

  return (
    <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-neutral-700/80 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base tracking-tight">
                เครื่องมือคำนวณบวกกำไรด่วน (Bulk Margin Calculator)
              </h4>
              <span className="text-[10px] bg-red-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                ใหม่
              </span>
            </div>
            <p className="text-neutral-400 text-xs mt-0.5">
              กำหนดอัตราบวกเพิ่มจากต้นทุนให้กับสินค้าตามหมวดหมู่ หรือทุกรายการพร้อมกัน
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Selector */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-bold uppercase">หมวดหมู่</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-xs font-semibold rounded-xl px-3 py-2 text-neutral-200 outline-none focus:border-red-500"
            >
              <option value="all">ทุกรายการทั้งหมด</option>
              <option value="slabs">แผ่นพื้น & Hollow Core</option>
              <option value="ipiles">เสาเข็ม I-Shape</option>
              <option value="spiles">เสาสี่เหลี่ยม S-Shape</option>
              <option value="fences">เสาเข็มหกเหลี่ยม & เสารั้ว</option>
              <option value="pipes">ท่อระบายน้ำ คสล.</option>
              <option value="basins">บ่อพัก คสล.</option>
            </select>
          </div>

          {/* Mode Selector */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-bold uppercase">รูปแบบ</span>
            <div className="flex bg-neutral-800 border border-neutral-700 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setMarkupMode("fixed")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  markupMode === "fixed" ? "bg-red-600 text-white shadow-xs" : "text-neutral-400 hover:text-white"
                }`}
              >
                <DollarSign size={12} />
                <span>+บาท</span>
              </button>
              <button
                type="button"
                onClick={() => setMarkupMode("percent")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  markupMode === "percent" ? "bg-red-600 text-white shadow-xs" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Percent size={12} />
                <span>+%</span>
              </button>
            </div>
          </div>

          {/* Value input */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-bold uppercase">
              {markupMode === "fixed" ? "จำนวนเงินบวกเพิ่ม" : "เปอร์เซ็นต์กำไร"}
            </span>
            <div className="relative flex items-center w-24 sm:w-28">
              <input
                type="number"
                min="0"
                step={markupMode === "percent" ? "1" : "5"}
                value={markupValue}
                onChange={(e) => setMarkupValue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-neutral-800 border border-neutral-700 text-xs font-bold font-mono rounded-xl pl-3 pr-7 py-2 text-white outline-none focus:border-red-500"
              />
              <span className="absolute right-2.5 text-xs text-neutral-400 font-bold">
                {markupMode === "fixed" ? "฿" : "%"}
              </span>
            </div>
          </div>

          {/* Action button */}
          <div className="flex flex-col gap-1 justify-end">
            <span className="text-[10px] text-transparent select-none">Action</span>
            <button
              type="button"
              onClick={handleApply}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-md ${
                isApplied
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 hover:bg-red-500 text-white"
              }`}
            >
              {isApplied ? (
                <>
                  <Check size={14} />
                  <span>คำนวณเรียบร้อย!</span>
                </>
              ) : (
                <>
                  <span>ปรับกำไรทันที</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkMarkupToolbar;
