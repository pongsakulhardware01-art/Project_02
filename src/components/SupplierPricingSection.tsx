import React, { useState } from "react";
import { Prices, CustomProduct } from "../types";
import { PriceCostMarkupItem } from "./PriceCostMarkupCard";
import { BulkMarkupToolbar } from "./BulkMarkupToolbar";
import { getUnifiedCatalog, getDeletedCatalogItems, CATEGORY_DEFINITIONS } from "../utils/productCatalog";
import {
  Percent,
  Layers,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  Plus,
  Trash2,
  RotateCcw,
  Package,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface SupplierPricingSectionProps {
  pricesInput: Prices;
  costsInput: Prices;
  customProducts?: CustomProduct[];
  deletedItemIds?: string[];
  onPriceChange: (field: any, val: number) => void;
  onCostChange: (field: any, val: number) => void;
  onMarkupChange: (field: any, val: number) => void;
  onApplyBulkMarkup: (category: string, mode: "fixed" | "percent", value: number) => void;
  onOpenAddModal?: (defaultCategory?: CustomProduct["category"]) => void;
  onDeleteProduct?: (id: string, name: string) => void;
  onRestoreProduct?: (id: string) => void;
}

export function SupplierPricingSection({
  pricesInput,
  costsInput,
  customProducts = [],
  deletedItemIds = [],
  onPriceChange,
  onCostChange,
  onMarkupChange,
  onApplyBulkMarkup,
  onOpenAddModal,
  onDeleteProduct,
  onRestoreProduct,
}: SupplierPricingSectionProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDeletedList, setShowDeletedList] = useState<boolean>(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; name: string } | null>(null);

  // Get current active unified catalog items
  const catalogItems = getUnifiedCatalog(
    {
      activeSupplierId: "",
      suppliers: [],
      prices: pricesInput,
      costs: costsInput,
      weights: {} as any,
      customProducts,
      deletedItemIds,
    },
    pricesInput,
    costsInput,
    undefined,
    customProducts,
    deletedItemIds
  );

  // Get deleted items for restoration
  const deletedItems = getDeletedCatalogItems(
    {
      activeSupplierId: "",
      suppliers: [],
      prices: pricesInput,
      costs: costsInput,
      weights: {} as any,
      customProducts,
      deletedItemIds,
    },
    deletedItemIds
  );

  // Filter items by category and search query
  const filteredItems = catalogItems.filter((item) => {
    const matchesCat = filterCategory === "all" || item.category === filterCategory;
    if (!matchesCat) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.subLabel && item.subLabel.toLowerCase().includes(q)) ||
      item.id.toLowerCase().includes(q)
    );
  });

  // Group items by category for layout
  const categoriesToDisplay = filterCategory === "all"
    ? CATEGORY_DEFINITIONS.filter((c) => c.id !== "all")
    : CATEGORY_DEFINITIONS.filter((c) => c.id === filterCategory);

  const confirmDelete = () => {
    if (deleteConfirmItem && onDeleteProduct) {
      onDeleteProduct(deleteConfirmItem.id, deleteConfirmItem.name);
      setDeleteConfirmItem(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: VAT Setting & Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
            <Percent size={15} />
            <span>อัตราภาษีมูลค่าเพิ่มทั่วไป (VAT)</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="settings-vat-input"
              type="number"
              min="0"
              max="100"
              value={pricesInput.vatPercent}
              onChange={(e) => onPriceChange("vatPercent", Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-24 bg-white border border-amber-300 py-1.5 px-3 rounded-xl text-sm font-bold font-mono text-amber-950 focus:ring-2 focus:ring-amber-400 outline-none"
            />
            <span className="text-xs font-bold text-amber-800">%</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-gradient-to-r from-red-50/70 to-neutral-50 p-3.5 rounded-2xl border border-red-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100/80 text-[#C62828] rounded-xl shrink-0">
              <TrendingUp size={20} />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-neutral-800 flex items-center gap-1.5 flex-wrap">
                <span>สูตรคำนวณกำไรอัตโนมัติ:</span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200 font-mono text-[#C62828] font-bold">
                  ต้นทุน + บวกกำไร = ราคาขาย
                </span>
              </div>
              <p className="text-neutral-500">
                คุณสามารถเพิ่มหรือลบรายการสินค้าได้อิสระ โดยราคาและน้ำหนักจะนำไปใช้ได้กับทุกส่วนในระบบ
              </p>
            </div>
          </div>

          {/* Prominent Add Item Button */}
          {onOpenAddModal && (
            <button
              type="button"
              onClick={() => onOpenAddModal()}
              className="px-3.5 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-extrabold rounded-xl shadow-sm flex items-center gap-1.5 transition ml-auto shrink-0"
            >
              <Plus size={14} />
              <span>+ เพิ่มรายการสินค้าใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Deleted Items Notification & Recovery Bar */}
      {deletedItems.length > 0 && (
        <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-neutral-200 text-neutral-700 rounded-lg">
                <Trash2 size={14} />
              </div>
              <span className="text-xs font-bold text-neutral-800">
                มีรายการสินค้าถูกลบออกจากระบบ {deletedItems.length} รายการ
              </span>
              <span className="text-[11px] text-neutral-500 hidden sm:inline">
                (รายการเหล่านี้จะไม่ปรากฏในหน้าคำนวณราคาและวิศวกรรมขนส่ง)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowDeletedList(!showDeletedList)}
              className="text-xs font-bold text-[#C62828] hover:underline flex items-center gap-1"
            >
              <span>{showDeletedList ? "ซ่อนรายการที่ถูกลบ" : "ดูและกู้คืนรายการ"}</span>
              {showDeletedList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showDeletedList && (
            <div className="mt-3 pt-3 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {deletedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      {item.subLabel || item.categoryLabel} • {item.unit}
                    </p>
                  </div>
                  {onRestoreProduct && (
                    <button
                      type="button"
                      onClick={() => onRestoreProduct(item.id)}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 transition"
                    >
                      <RotateCcw size={11} />
                      <span>กู้คืน</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bulk Margin Quick Toolbar */}
      <BulkMarkupToolbar
        costs={costsInput}
        prices={pricesInput}
        onApplyBulkMarkup={onApplyBulkMarkup}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORY_DEFINITIONS.map((c) => {
            const count = c.id === "all" 
              ? catalogItems.length 
              : catalogItems.filter((i) => i.category === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilterCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  filterCategory === c.id
                    ? "bg-[#C62828] text-white shadow-xs"
                    : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-100"
                }`}
              >
                <span>{c.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                    filterCategory === c.id ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-60 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-[#C62828] focus:ring-1 focus:ring-red-200 outline-none"
            />
          </div>

          {onOpenAddModal && (
            <button
              type="button"
              onClick={() => onOpenAddModal(filterCategory !== "all" ? (filterCategory as any) : undefined)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1 transition"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">เพิ่มสินค้า</span>
            </button>
          )}
        </div>
      </div>

      {/* Item Groups Container */}
      <div className="space-y-6">
        {categoriesToDisplay.map((cat) => {
          const itemsInCat = filteredItems.filter((i) => i.category === cat.id);
          if (itemsInCat.length === 0) {
            if (filterCategory !== "all") {
              return (
                <div key={cat.id} className="text-center py-10 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                  <Package className="mx-auto text-neutral-300 mb-2" size={32} />
                  <p className="text-xs font-bold text-neutral-500">ไม่มีรายการสินค้าในหมวดหมู่นี้</p>
                  {onOpenAddModal && (
                    <button
                      type="button"
                      onClick={() => onOpenAddModal(cat.id as any)}
                      className="mt-3 px-3.5 py-1.5 bg-[#C62828] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 hover:bg-[#B71C1C] transition"
                    >
                      <Plus size={13} />
                      <span>+ เพิ่มสินค้าชิ้นแรกในหมวด{cat.label}</span>
                    </button>
                  )}
                </div>
              );
            }
            return null;
          }

          return (
            <div key={cat.id} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.dotColor} inline-block`} />
                  <h5 className="font-extrabold text-sm text-neutral-800">
                    {cat.id === "slabs" && "กลุ่มราคาแผ่นพื้นคอนกรีตอัดแรง (บาท / ตร.ม.)"}
                    {cat.id === "hex_fence" && "เสาเข็มหกเหลี่ยม & เสารั้ว (บาท / เมตร)"}
                    {cat.id === "i_piles" && "กลุ่มเสาเข็มรูปตัวไอ I-Shape (บาท / เมตร)"}
                    {cat.id === "s_piles" && "กลุ่มเสาเข็มสี่เหลี่ยมตัน S-Shape (บาท / เมตร)"}
                    {cat.id === "pipes" && "กลุ่มท่อระบายน้ำ คสล. (บาท / ท่อน)"}
                    {cat.id === "basins" && "กลุ่มบ่อพัก คสล. (บาท / ชิ้น)"}
                    {cat.id === "other" && "สินค้าสั่งทำ / กำหนดเองอื่นๆ"}
                  </h5>
                  <span className="text-[11px] font-mono text-neutral-400 font-semibold bg-neutral-100 px-2 py-0.5 rounded-full">
                    {itemsInCat.length} รายการ
                  </span>
                </div>

                {onOpenAddModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAddModal(cat.id as any)}
                    className="text-[11px] font-bold text-neutral-500 hover:text-[#C62828] flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    <Plus size={12} />
                    <span>เพิ่มในหมวดนี้</span>
                  </button>
                )}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {itemsInCat.map((item) => (
                  <PriceCostMarkupItem
                    key={item.id}
                    idPrefix={item.id}
                    label={item.name}
                    subLabel={item.subLabel}
                    field={item.fieldKey || item.id}
                    unit={item.unit}
                    cost={item.cost}
                    price={item.price}
                    isTIS={item.isTIS}
                    isCustom={item.isCustom}
                    onCostChange={onCostChange}
                    onMarkupChange={onMarkupChange}
                    onPriceChange={onPriceChange}
                    onDelete={
                      onDeleteProduct
                        ? () => setDeleteConfirmItem({ id: item.id, name: item.name })
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 text-[#C62828] rounded-xl">
                <Trash2 size={20} />
              </div>
              <h4 className="font-extrabold text-neutral-800 text-sm">ยืนยันการลบรายการสินค้า</h4>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              คุณต้องการลบรายการ <strong className="text-neutral-900">"{deleteConfirmItem.name}"</strong> ออกจากระบบใช่หรือไม่?
              <br />
              <span className="text-neutral-400 text-[11px] block mt-1">
                * รายการนี้จะไม่ถูกนำไปใช้คำนวณราคาและน้ำหนักในระบบ (สามารถกู้คืนได้ภายหลัง)
              </span>
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-sm transition"
              >
                ลบรายการนี้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierPricingSection;
