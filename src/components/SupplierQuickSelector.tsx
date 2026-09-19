import React, { useState } from "react";
import { AppSettings, SupplierProfile } from "../types";
import { Building2, ChevronDown, Check, Settings, Plus, Sparkles, Scale, DollarSign, Factory, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fmt } from "../utils";

interface SupplierQuickSelectorProps {
  settings: AppSettings;
  onSelectSupplier?: (supplierId: string) => void;
  onNavigateToSettings?: () => void;
  variant?: "compact" | "full" | "inline";
  className?: string;
}

export default function SupplierQuickSelector({
  settings,
  onSelectSupplier,
  onNavigateToSettings,
  variant = "full",
  className = "",
}: SupplierQuickSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const suppliers = settings.suppliers || [];
  const activeSupplier = suppliers.find((s) => s.id === settings.activeSupplierId) || suppliers[0] || {
    id: "default",
    name: "พงษ์สกุลฮาร์ดแวร์ (โรงงานหลัก)",
    prices: settings.prices,
    weights: settings.weights,
  };

  const handleSelect = (id: string) => {
    if (onSelectSupplier) {
      onSelectSupplier(id);
    }
    setIsOpen(false);
  };

  if (variant === "compact") {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-neutral-900/90 hover:bg-neutral-900 text-white px-3 py-1.5 rounded-xl border border-neutral-700 text-xs font-semibold shadow-sm transition group"
        >
          <Factory size={13} className="text-amber-400" />
          <span className="truncate max-w-[140px] sm:max-w-[200px] font-medium text-amber-200">
            {activeSupplier.name}
          </span>
          <ChevronDown size={13} className={`text-neutral-400 group-hover:text-white transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.96 }}
                className="absolute right-0 mt-1.5 w-72 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-2 z-50 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">เลือกซัพพลายเออร์ที่คำนวณ</span>
                  <span className="text-[10px] bg-red-50 text-[#C62828] font-bold px-2 py-0.5 rounded-full">
                    {suppliers.length} รายการ
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                  {suppliers.map((sup) => {
                    const isSelected = sup.id === settings.activeSupplierId;
                    return (
                      <button
                        key={sup.id}
                        onClick={() => handleSelect(sup.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                          isSelected
                            ? "bg-red-50 text-[#C62828] font-bold border border-red-200/60"
                            : "hover:bg-neutral-50 text-neutral-700"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate">{sup.name}</span>
                            {sup.code && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-neutral-100 text-neutral-500 rounded font-mono">
                                {sup.code}
                              </span>
                            )}
                          </div>
                          {sup.description && (
                            <p className="text-[10px] text-neutral-400 font-normal truncate mt-0.5">{sup.description}</p>
                          )}
                        </div>
                        {isSelected && <Check size={14} className="text-[#C62828] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {onNavigateToSettings && (
                  <div className="pt-2 mt-1 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateToSettings();
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Settings size={13} className="text-[#C62828]" />
                      <span>จัดการ / เพิ่มซัพพลายเออร์</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full banner variant (suitable for placement atop calculator components)
  return (
    <div className={`bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-2xl p-3.5 sm:p-4 border border-neutral-700 shadow-md ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Active Supplier Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-red-500/20 border border-red-500/30 text-amber-300 rounded-xl shrink-0 shadow-inner">
            <Factory size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ซัพพลายเออร์ที่เลือกคำนวณ
              </span>
              {activeSupplier.code && (
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
                  {activeSupplier.code}
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
              {activeSupplier.name}
            </h4>
            {activeSupplier.description && (
              <p className="text-[11px] text-neutral-400 truncate max-w-xl">
                {activeSupplier.description}
              </p>
            )}
          </div>
        </div>

        {/* Dropdown Action & Navigation */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition border border-red-400/30 group"
            >
              <span>เปลี่ยนซัพพลายเออร์</span>
              <ChevronDown size={14} className={`text-red-200 group-hover:text-white transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-2.5 z-50 text-neutral-800"
                  >
                    <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">เลือกซัพพลายเออร์ที่ต้องการ</span>
                      <span className="text-[10px] bg-red-50 text-[#C62828] font-bold px-2 py-0.5 rounded-full">
                        {suppliers.length} ราย
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1.5 space-y-1">
                      {suppliers.map((sup) => {
                        const isSelected = sup.id === settings.activeSupplierId;
                        return (
                          <button
                            key={sup.id}
                            onClick={() => handleSelect(sup.id)}
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                              isSelected
                                ? "bg-red-50 text-[#C62828] font-bold border border-red-200"
                                : "hover:bg-neutral-50 text-neutral-700"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold truncate">{sup.name}</span>
                                {sup.code && (
                                  <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded font-mono">
                                    {sup.code}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500">
                                <span>แผ่นพื้น ธรรมดา ฿{sup.prices?.normalBoardPrice || 210} / มอก ฿{sup.prices?.mocBoardPrice || 230}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="p-1 bg-[#C62828] text-white rounded-full shrink-0">
                                <Check size={12} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {onNavigateToSettings && (
                      <div className="pt-2 mt-1 border-t border-neutral-100">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onNavigateToSettings();
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <Settings size={14} className="text-[#C62828]" />
                          <span>จัดการ/เพิ่มซัพพลายเออร์ใหม่ ในการตั้งค่า</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {onNavigateToSettings && (
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl border border-neutral-600 transition"
              title="จัดการซัพพลายเออร์และราคา"
            >
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
