import React from "react";
import { Prices } from "../types";
import { Plus, Equal, Tag, Sparkles, HelpCircle, Trash2 } from "lucide-react";

interface PriceCostMarkupItemProps {
  key?: React.Key;
  idPrefix: string;
  label: string;
  subLabel?: string;
  field?: keyof Prices | string;
  unit: string;
  cost: number;
  price: number;
  isTIS?: boolean;
  isCustom?: boolean;
  onCostChange: (field: any, val: number) => void;
  onMarkupChange: (field: any, val: number) => void;
  onPriceChange: (field: any, val: number) => void;
  onDelete?: () => void;
}

export function PriceCostMarkupItem({
  idPrefix,
  label,
  subLabel,
  field,
  unit,
  cost,
  price,
  isTIS = false,
  isCustom = false,
  onCostChange,
  onMarkupChange,
  onPriceChange,
  onDelete,
}: PriceCostMarkupItemProps) {
  const currentCost = cost || 0;
  const currentPrice = price || 0;
  const markup = Math.max(0, Number((currentPrice - currentCost).toFixed(2)));
  const marginPercent = currentCost > 0 
    ? (((currentPrice - currentCost) / currentCost) * 100).toFixed(1)
    : "0.0";

  const targetField = field || idPrefix;

  return (
    <div
      id={`item-card-${idPrefix}`}
      className={`rounded-2xl p-3.5 border transition-all duration-200 relative group ${
        isTIS
          ? "bg-gradient-to-br from-red-50/40 via-white to-red-50/20 border-red-200/80 shadow-xs"
          : isCustom
          ? "bg-gradient-to-br from-purple-50/30 via-white to-indigo-50/20 border-purple-200/90 shadow-xs"
          : "bg-white border-neutral-200/90 shadow-xs hover:border-neutral-300"
      }`}
    >
      {/* Header with Title, Badges & Delete Button */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs font-bold ${isTIS ? "text-[#C62828]" : isCustom ? "text-purple-900" : "text-neutral-800"}`}>
            {label}
          </span>
          {isTIS && (
            <span className="bg-red-100 text-[#C62828] text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
              มอก.
            </span>
          )}
          {isCustom && (
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
              กำหนดเอง
            </span>
          )}
          {subLabel && (
            <span className="text-[11px] text-neutral-400 font-medium">({subLabel})</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100/80 px-2 py-0.5 rounded-full font-semibold">
            {unit}
          </span>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="ลบรายการสินค้านี้"
              className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 3 Interactive Columns: Cost + Markup = Selling Price */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* 1. Cost (ต้นทุน) */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`cost-${idPrefix}`}
            className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1"
          >
            <Tag size={11} className="text-neutral-400" />
            <span>ต้นทุน</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-xs text-neutral-400 font-mono font-bold">฿</span>
            <input
              id={`cost-${idPrefix}`}
              type="number"
              min="0"
              step="any"
              value={currentCost === 0 ? "" : currentCost}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                onCostChange(targetField, val);
              }}
              placeholder="0"
              className="w-full pl-6 pr-2 py-1.5 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs font-bold font-mono text-neutral-800 focus:bg-white focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300 outline-none transition"
            />
          </div>
        </div>

        {/* 2. Markup (+ บวกเพิ่ม) */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px]">
            <label
              htmlFor={`markup-${idPrefix}`}
              className="font-bold text-emerald-700 flex items-center gap-0.5"
            >
              <Plus size={12} />
              <span>บวกกำไร</span>
            </label>
            <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 px-1 rounded">
              +{marginPercent}%
            </span>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-xs text-emerald-600 font-mono font-bold">+</span>
            <input
              id={`markup-${idPrefix}`}
              type="number"
              min="0"
              step="any"
              value={markup === 0 ? "" : markup}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                onMarkupChange(targetField, val);
              }}
              placeholder="0"
              className="w-full pl-6 pr-2 py-1.5 bg-emerald-50/40 border border-emerald-300/70 rounded-xl text-xs font-bold font-mono text-emerald-800 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300 outline-none transition"
            />
          </div>
        </div>

        {/* 3. Selling Price (= ราคาขาย) */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`price-${idPrefix}`}
            className="text-[11px] font-bold text-[#C62828] flex items-center gap-0.5"
          >
            <Equal size={12} />
            <span>ราคาขาย (ระบบ)</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-xs text-[#C62828] font-mono font-bold">฿</span>
            <input
              id={`price-${idPrefix}`}
              type="number"
              min="0"
              step="any"
              value={currentPrice === 0 ? "" : currentPrice}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                onPriceChange(targetField, val);
              }}
              placeholder="0"
              className="w-full pl-6 pr-2 py-1.5 bg-red-50/40 border border-red-300/80 rounded-xl text-xs font-extrabold font-mono text-[#8B0000] focus:bg-white focus:border-[#C62828] focus:ring-1 focus:ring-red-300 outline-none transition shadow-2xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceCostMarkupItem;
