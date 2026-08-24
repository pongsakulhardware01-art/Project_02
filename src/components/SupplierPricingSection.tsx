import React, { useState } from "react";
import { Prices } from "../types";
import { PriceCostMarkupItem } from "./PriceCostMarkupCard";
import { BulkMarkupToolbar } from "./BulkMarkupToolbar";
import {
  Percent,
  Layers,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  DollarSign
} from "lucide-react";

interface SupplierPricingSectionProps {
  pricesInput: Prices;
  costsInput: Prices;
  onPriceChange: (field: keyof Prices, val: number) => void;
  onCostChange: (field: keyof Prices, val: number) => void;
  onMarkupChange: (field: keyof Prices, val: number) => void;
  onApplyBulkMarkup: (category: string, mode: "fixed" | "percent", value: number) => void;
}

export function SupplierPricingSection({
  pricesInput,
  costsInput,
  onPriceChange,
  onCostChange,
  onMarkupChange,
  onApplyBulkMarkup,
}: SupplierPricingSectionProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", label: "ทั้งหมด" },
    { id: "slabs", label: "แผ่นพื้น" },
    { id: "hex_fence", label: "เสารั้ว & หกเหลี่ยม" },
    { id: "i_piles", label: "เสาเข็ม I" },
    { id: "s_piles", label: "เสาเข็มสี่เหลี่ยม S" },
    { id: "pipes", label: "ท่อ คสล." },
    { id: "basins", label: "บ่อพัก คสล." },
  ];

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

        <div className="md:col-span-2 bg-gradient-to-r from-red-50/70 to-neutral-50 p-3.5 rounded-2xl border border-red-100 flex items-center gap-3">
          <div className="p-2.5 bg-red-100/80 text-[#C62828] rounded-xl shrink-0">
            <TrendingUp size={20} />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-neutral-800 flex items-center gap-1.5">
              <span>สูตรคำนวณกำไรอัตโนมัติ:</span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200 font-mono text-[#C62828]">
                ต้นทุน + บวกกำไร = ราคาขาย
              </span>
            </div>
            <p className="text-neutral-500">
              คุณสามารถกรอกต้นทุนและส่วนต่างกำไรเพื่อให้ออกราคาขาย หรือกรอกราคาขายโดยตรง ระบบจะคำนวณกำไรให้อัตโนมัติ
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Margin Quick Toolbar */}
      <BulkMarkupToolbar
        costs={costsInput}
        prices={pricesInput}
        onApplyBulkMarkup={onApplyBulkMarkup}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilterCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterCategory === c.id
                  ? "bg-[#C62828] text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-100"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

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
      </div>

      {/* Item Groups Container */}
      <div className="space-y-6">
        {/* 1. Slabs Group */}
        {(filterCategory === "all" || filterCategory === "slabs") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                <h5 className="font-extrabold text-sm text-neutral-800">กลุ่มราคาแผ่นพื้นคอนกรีตอัดแรง (บาท / ตร.ม.)</h5>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PriceCostMarkupItem
                idPrefix="normalBoardPrice"
                label="แผ่นพื้นท้องเรียบธรรมดา"
                subLabel="ฐานลวด 4 เส้น"
                field="normalBoardPrice"
                unit="บ./ตร.ม."
                cost={costsInput.normalBoardPrice}
                price={pricesInput.normalBoardPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="mocBoardPrice"
                label="แผ่นพื้นท้องเรียบ มอก."
                subLabel="มาตรฐานอุตสาหกรรม"
                field="mocBoardPrice"
                unit="บ./ตร.ม."
                isTIS
                cost={costsInput.mocBoardPrice}
                price={pricesInput.mocBoardPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="hcPriceSqm"
                label="แผ่นพื้นกลวง Hollow Core"
                subLabel="ความหนามาตรฐาน"
                field="hcPriceSqm"
                unit="บ./ตร.ม."
                cost={costsInput.hcPriceSqm}
                price={pricesInput.hcPriceSqm}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
            </div>
          </div>
        )}

        {/* 2. Hex and Fence Group */}
        {(filterCategory === "all" || filterCategory === "hex_fence") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <h5 className="font-extrabold text-sm text-neutral-800">เสาเข็มหกเหลี่ยม & เสารั้ว (บาท / เมตร)</h5>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <PriceCostMarkupItem
                idPrefix="hexPilePrice"
                label="เสาเข็มหกเหลี่ยมกลวง"
                subLabel="Hex Pile"
                field="hexPilePrice"
                unit="บ./ม."
                cost={costsInput.hexPilePrice}
                price={pricesInput.hexPilePrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="fence3Price"
                label="เสารั้วลวดหนาม 3 นิ้ว"
                subLabel="หน้าตัด 3 นิ้ว"
                field="fence3Price"
                unit="บ./ม."
                cost={costsInput.fence3Price}
                price={pricesInput.fence3Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="fence4Price"
                label="เสารั้วลวดหนาม 4 นิ้ว"
                subLabel="หน้าตัด 4 นิ้ว"
                field="fence4Price"
                unit="บ./ม."
                cost={costsInput.fence4Price}
                price={pricesInput.fence4Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
            </div>
          </div>
        )}

        {/* 3. I-Shape Piles Group */}
        {(filterCategory === "all" || filterCategory === "i_piles") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-700 inline-block" />
                <h5 className="font-extrabold text-sm text-neutral-800">กลุ่มเสาเข็มรูปตัวไอ I-Shape (บาท / เมตร)</h5>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* I-15 */}
              <PriceCostMarkupItem
                idPrefix="i15Price"
                label="เสาเข็มไอ I-15"
                subLabel="ท่อนเดียว (Single)"
                field="i15Price"
                unit="บ./ม."
                cost={costsInput.i15Price}
                price={pricesInput.i15Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* I-18 */}
              <PriceCostMarkupItem
                idPrefix="i18NoTISPrice"
                label="เสาเข็มไอ I-18 ธรรมดา"
                subLabel="ท่อนเดียว"
                field="i18NoTISPrice"
                unit="บ./ม."
                cost={costsInput.i18NoTISPrice}
                price={pricesInput.i18NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i18TISPrice"
                label="เสาเข็มไอ I-18 มอก."
                subLabel="ท่อนเดียว"
                field="i18TISPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i18TISPrice}
                price={pricesInput.i18TISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i18JointPrice"
                label="เสาเข็มไอ I-18 ธรรมดา"
                subLabel="ท่อนต่อ (Joint)"
                field="i18JointPrice"
                unit="บ./ม."
                cost={costsInput.i18JointPrice}
                price={pricesInput.i18JointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i18TISJointPrice"
                label="เสาเข็มไอ I-18 มอก."
                subLabel="ท่อนต่อ (Joint)"
                field="i18TISJointPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i18TISJointPrice}
                price={pricesInput.i18TISJointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* I-22 */}
              <PriceCostMarkupItem
                idPrefix="i22NoTISPrice"
                label="เสาเข็มไอ I-22 ธรรมดา"
                subLabel="ท่อนเดียว"
                field="i22NoTISPrice"
                unit="บ./ม."
                cost={costsInput.i22NoTISPrice}
                price={pricesInput.i22NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i22TISPrice"
                label="เสาเข็มไอ I-22 มอก."
                subLabel="ท่อนเดียว"
                field="i22TISPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i22TISPrice}
                price={pricesInput.i22TISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i22JointPrice"
                label="เสาเข็มไอ I-22 ธรรมดา"
                subLabel="ท่อนต่อ (Joint)"
                field="i22JointPrice"
                unit="บ./ม."
                cost={costsInput.i22JointPrice}
                price={pricesInput.i22JointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i22TISJointPrice"
                label="เสาเข็มไอ I-22 มอก."
                subLabel="ท่อนต่อ (Joint)"
                field="i22TISJointPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i22TISJointPrice}
                price={pricesInput.i22TISJointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* I-26 */}
              <PriceCostMarkupItem
                idPrefix="i26NoTISPrice"
                label="เสาเข็มไอ I-26 ธรรมดา"
                subLabel="ท่อนเดียว"
                field="i26NoTISPrice"
                unit="บ./ม."
                cost={costsInput.i26NoTISPrice}
                price={pricesInput.i26NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i26TISPrice"
                label="เสาเข็มไอ I-26 มอก."
                subLabel="ท่อนเดียว"
                field="i26TISPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i26TISPrice}
                price={pricesInput.i26TISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i26NoTISJointPrice"
                label="เสาเข็มไอ I-26 ธรรมดา"
                subLabel="ท่อนต่อ (Joint)"
                field="i26NoTISJointPrice"
                unit="บ./ม."
                cost={costsInput.i26NoTISJointPrice}
                price={pricesInput.i26NoTISJointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i26TISJointPrice"
                label="เสาเข็มไอ I-26 มอก."
                subLabel="ท่อนต่อ (Joint)"
                field="i26TISJointPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i26TISJointPrice}
                price={pricesInput.i26TISJointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* I-30 */}
              <PriceCostMarkupItem
                idPrefix="i30NoTISPrice"
                label="เสาเข็มไอ I-30 ธรรมดา"
                subLabel="ท่อนเดียว"
                field="i30NoTISPrice"
                unit="บ./ม."
                cost={costsInput.i30NoTISPrice}
                price={pricesInput.i30NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i30TISPrice"
                label="เสาเข็มไอ I-30 มอก."
                subLabel="ท่อนเดียว"
                field="i30TISPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i30TISPrice}
                price={pricesInput.i30TISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i30NoTISJointPrice"
                label="เสาเข็มไอ I-30 ธรรมดา"
                subLabel="ท่อนต่อ (Joint)"
                field="i30NoTISJointPrice"
                unit="บ./ม."
                cost={costsInput.i30NoTISJointPrice}
                price={pricesInput.i30NoTISJointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i30TISJointPrice"
                label="เสาเข็มไอ I-30 มอก."
                subLabel="ท่อนต่อ (Joint)"
                field="i30TISJointPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i30TISJointPrice}
                price={pricesInput.i30TISJointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* I-35 & I-40 */}
              <PriceCostMarkupItem
                idPrefix="i35TISPrice"
                label="เสาเข็มไอ I-35 มอก."
                subLabel="ท่อนเดียว"
                field="i35TISPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i35TISPrice}
                price={pricesInput.i35TISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i35TISJointPrice"
                label="เสาเข็มไอ I-35 มอก."
                subLabel="ท่อนต่อ (Joint)"
                field="i35TISJointPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i35TISJointPrice}
                price={pricesInput.i35TISJointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i40TISPrice"
                label="เสาเข็มไอ I-40 มอก."
                subLabel="ท่อนเดียว"
                field="i40TISPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i40TISPrice}
                price={pricesInput.i40TISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="i40TISJointPrice"
                label="เสาเข็มไอ I-40 มอก."
                subLabel="ท่อนต่อ (Joint)"
                field="i40TISJointPrice"
                unit="บ./ม."
                isTIS
                cost={costsInput.i40TISJointPrice}
                price={pricesInput.i40TISJointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
            </div>
          </div>
        )}

        {/* 4. S-Shape Piles Group */}
        {(filterCategory === "all" || filterCategory === "s_piles") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                <h5 className="font-extrabold text-sm text-neutral-800">กลุ่มเสาเข็มสี่เหลี่ยมตัน S-Shape (บาท / เมตร)</h5>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* S-18 */}
              <PriceCostMarkupItem
                idPrefix="s18Price"
                label="เสาสี่เหลี่ยม S-18"
                subLabel="ท่อนเดียว"
                field="s18Price"
                unit="บ./ม."
                cost={costsInput.s18Price}
                price={pricesInput.s18Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="s18JointPrice"
                label="เสาสี่เหลี่ยม S-18"
                subLabel="ท่อนต่อ (Joint)"
                field="s18JointPrice"
                unit="บ./ม."
                cost={costsInput.s18JointPrice}
                price={pricesInput.s18JointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* S-22 */}
              <PriceCostMarkupItem
                idPrefix="s22Price"
                label="เสาสี่เหลี่ยม S-22"
                subLabel="ท่อนเดียว"
                field="s22Price"
                unit="บ./ม."
                cost={costsInput.s22Price}
                price={pricesInput.s22Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="s22JointPrice"
                label="เสาสี่เหลี่ยม S-22"
                subLabel="ท่อนต่อ (Joint)"
                field="s22JointPrice"
                unit="บ./ม."
                cost={costsInput.s22JointPrice}
                price={pricesInput.s22JointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* S-26 */}
              <PriceCostMarkupItem
                idPrefix="s26Price"
                label="เสาสี่เหลี่ยม S-26"
                subLabel="ท่อนเดียว"
                field="s26Price"
                unit="บ./ม."
                cost={costsInput.s26Price}
                price={pricesInput.s26Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="s26JointPrice"
                label="เสาสี่เหลี่ยม S-26"
                subLabel="ท่อนต่อ (Joint)"
                field="s26JointPrice"
                unit="บ./ม."
                cost={costsInput.s26JointPrice}
                price={pricesInput.s26JointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* S-30 */}
              <PriceCostMarkupItem
                idPrefix="s30Price"
                label="เสาสี่เหลี่ยม S-30"
                subLabel="ท่อนเดียว"
                field="s30Price"
                unit="บ./ม."
                cost={costsInput.s30Price}
                price={pricesInput.s30Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="s30JointPrice"
                label="เสาสี่เหลี่ยม S-30"
                subLabel="ท่อนต่อ (Joint)"
                field="s30JointPrice"
                unit="บ./ม."
                cost={costsInput.s30JointPrice}
                price={pricesInput.s30JointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* S-35 */}
              <PriceCostMarkupItem
                idPrefix="s35Price"
                label="เสาสี่เหลี่ยม S-35"
                subLabel="ท่อนเดียว"
                field="s35Price"
                unit="บ./ม."
                cost={costsInput.s35Price}
                price={pricesInput.s35Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="s35JointPrice"
                label="เสาสี่เหลี่ยม S-35"
                subLabel="ท่อนต่อ (Joint)"
                field="s35JointPrice"
                unit="บ./ม."
                cost={costsInput.s35JointPrice}
                price={pricesInput.s35JointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* S-40 */}
              <PriceCostMarkupItem
                idPrefix="s40Price"
                label="เสาสี่เหลี่ยม S-40"
                subLabel="ท่อนเดียว"
                field="s40Price"
                unit="บ./ม."
                cost={costsInput.s40Price}
                price={pricesInput.s40Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="s40JointPrice"
                label="เสาสี่เหลี่ยม S-40"
                subLabel="ท่อนต่อ (Joint)"
                field="s40JointPrice"
                unit="บ./ม."
                cost={costsInput.s40JointPrice}
                price={pricesInput.s40JointPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
            </div>
          </div>
        )}

        {/* 5. Pipes Group */}
        {(filterCategory === "all" || filterCategory === "pipes") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <h5 className="font-extrabold text-sm text-neutral-800">ท่อระบายน้ำ คสล. (บาท / ท่อน - ยาว 1.00 ม.)</h5>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Ø 0.30 */}
              <PriceCostMarkupItem
                idPrefix="pipe030NoTISPrice"
                label="ท่อ Ø 0.30 ม. ธรรมดา"
                subLabel="ไม่ระบุชั้น"
                field="pipe030NoTISPrice"
                unit="บ./ท่อน"
                cost={costsInput.pipe030NoTISPrice}
                price={pricesInput.pipe030NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe030T3Price"
                label="ท่อ Ø 0.30 ม. มอก.3"
                subLabel="ชั้น 3"
                field="pipe030T3Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe030T3Price}
                price={pricesInput.pipe030T3Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe030T2Price"
                label="ท่อ Ø 0.30 ม. มอก.2"
                subLabel="ชั้น 2"
                field="pipe030T2Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe030T2Price}
                price={pricesInput.pipe030T2Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* Ø 0.40 */}
              <PriceCostMarkupItem
                idPrefix="pipe040NoTISPrice"
                label="ท่อ Ø 0.40 ม. ธรรมดา"
                subLabel="ไม่ระบุชั้น"
                field="pipe040NoTISPrice"
                unit="บ./ท่อน"
                cost={costsInput.pipe040NoTISPrice}
                price={pricesInput.pipe040NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe040T3Price"
                label="ท่อ Ø 0.40 ม. มอก.3"
                subLabel="ชั้น 3"
                field="pipe040T3Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe040T3Price}
                price={pricesInput.pipe040T3Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe040T2Price"
                label="ท่อ Ø 0.40 ม. มอก.2"
                subLabel="ชั้น 2"
                field="pipe040T2Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe040T2Price}
                price={pricesInput.pipe040T2Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* Ø 0.50 */}
              <PriceCostMarkupItem
                idPrefix="pipe050NoTISPrice"
                label="ท่อ Ø 0.50 ม. ธรรมดา"
                subLabel="ไม่ระบุชั้น"
                field="pipe050NoTISPrice"
                unit="บ./ท่อน"
                cost={costsInput.pipe050NoTISPrice}
                price={pricesInput.pipe050NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe050T3Price"
                label="ท่อ Ø 0.50 ม. มอก.3"
                subLabel="ชั้น 3"
                field="pipe050T3Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe050T3Price}
                price={pricesInput.pipe050T3Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe050T2Price"
                label="ท่อ Ø 0.50 ม. มอก.2"
                subLabel="ชั้น 2"
                field="pipe050T2Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe050T2Price}
                price={pricesInput.pipe050T2Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* Ø 0.60 */}
              <PriceCostMarkupItem
                idPrefix="pipe060NoTISPrice"
                label="ท่อ Ø 0.60 ม. ธรรมดา"
                subLabel="ไม่ระบุชั้น"
                field="pipe060NoTISPrice"
                unit="บ./ท่อน"
                cost={costsInput.pipe060NoTISPrice}
                price={pricesInput.pipe060NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe060T3Price"
                label="ท่อ Ø 0.60 ม. มอก.3"
                subLabel="ชั้น 3"
                field="pipe060T3Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe060T3Price}
                price={pricesInput.pipe060T3Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe060T2Price"
                label="ท่อ Ø 0.60 ม. มอก.2"
                subLabel="ชั้น 2"
                field="pipe060T2Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe060T2Price}
                price={pricesInput.pipe060T2Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* Ø 0.80 */}
              <PriceCostMarkupItem
                idPrefix="pipe080NoTISPrice"
                label="ท่อ Ø 0.80 ม. ธรรมดา"
                subLabel="ไม่ระบุชั้น"
                field="pipe080NoTISPrice"
                unit="บ./ท่อน"
                cost={costsInput.pipe080NoTISPrice}
                price={pricesInput.pipe080NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe080T3Price"
                label="ท่อ Ø 0.80 ม. มอก.3"
                subLabel="ชั้น 3"
                field="pipe080T3Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe080T3Price}
                price={pricesInput.pipe080T3Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe080T2Price"
                label="ท่อ Ø 0.80 ม. มอก.2"
                subLabel="ชั้น 2"
                field="pipe080T2Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe080T2Price}
                price={pricesInput.pipe080T2Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* Ø 1.00 */}
              <PriceCostMarkupItem
                idPrefix="pipe100NoTISPrice"
                label="ท่อ Ø 1.00 ม. ธรรมดา"
                subLabel="ไม่ระบุชั้น"
                field="pipe100NoTISPrice"
                unit="บ./ท่อน"
                cost={costsInput.pipe100NoTISPrice}
                price={pricesInput.pipe100NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe100T3Price"
                label="ท่อ Ø 1.00 ม. มอก.3"
                subLabel="ชั้น 3"
                field="pipe100T3Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe100T3Price}
                price={pricesInput.pipe100T3Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe100T2Price"
                label="ท่อ Ø 1.00 ม. มอก.2"
                subLabel="ชั้น 2"
                field="pipe100T2Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe100T2Price}
                price={pricesInput.pipe100T2Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* Ø 1.20 */}
              <PriceCostMarkupItem
                idPrefix="pipe120NoTISPrice"
                label="ท่อ Ø 1.20 ม. ธรรมดา"
                subLabel="ไม่ระบุชั้น"
                field="pipe120NoTISPrice"
                unit="บ./ท่อน"
                cost={costsInput.pipe120NoTISPrice}
                price={pricesInput.pipe120NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe120T3Price"
                label="ท่อ Ø 1.20 ม. มอก.3"
                subLabel="ชั้น 3"
                field="pipe120T3Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe120T3Price}
                price={pricesInput.pipe120T3Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe120T2Price"
                label="ท่อ Ø 1.20 ม. มอก.2"
                subLabel="ชั้น 2"
                field="pipe120T2Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe120T2Price}
                price={pricesInput.pipe120T2Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />

              {/* Ø 1.50 */}
              <PriceCostMarkupItem
                idPrefix="pipe150NoTISPrice"
                label="ท่อ Ø 1.50 ม. ธรรมดา"
                subLabel="ไม่ระบุชั้น"
                field="pipe150NoTISPrice"
                unit="บ./ท่อน"
                cost={costsInput.pipe150NoTISPrice}
                price={pricesInput.pipe150NoTISPrice}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe150T3Price"
                label="ท่อ Ø 1.50 ม. มอก.3"
                subLabel="ชั้น 3"
                field="pipe150T3Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe150T3Price}
                price={pricesInput.pipe150T3Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="pipe150T2Price"
                label="ท่อ Ø 1.50 ม. มอก.2"
                subLabel="ชั้น 2"
                field="pipe150T2Price"
                unit="บ./ท่อน"
                isTIS
                cost={costsInput.pipe150T2Price}
                price={pricesInput.pipe150T2Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
            </div>
          </div>
        )}

        {/* 6. Catch Basins Group */}
        {(filterCategory === "all" || filterCategory === "basins") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" />
                <h5 className="font-extrabold text-sm text-neutral-800">บ่อพัก คสล. สำเร็จรูป (บาท / ชุด)</h5>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <PriceCostMarkupItem
                idPrefix="basin030Price"
                label="บ่อพัก Ø 0.30 ม."
                subLabel="ขนาดท่อ 0.30 ม."
                field="basin030Price"
                unit="บ./ชุด"
                cost={costsInput.basin030Price}
                price={pricesInput.basin030Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="basin040Price"
                label="บ่อพัก Ø 0.40 ม."
                subLabel="ขนาดท่อ 0.40 ม."
                field="basin040Price"
                unit="บ./ชุด"
                cost={costsInput.basin040Price}
                price={pricesInput.basin040Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="basin050Price"
                label="บ่อพัก Ø 0.50 ม."
                subLabel="ขนาดท่อ 0.50 ม."
                field="basin050Price"
                unit="บ./ชุด"
                cost={costsInput.basin050Price}
                price={pricesInput.basin050Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="basin060Price"
                label="บ่อพัก Ø 0.60 ม."
                subLabel="ขนาดท่อ 0.60 ม."
                field="basin060Price"
                unit="บ./ชุด"
                cost={costsInput.basin060Price}
                price={pricesInput.basin060Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="basin080Price"
                label="บ่อพัก Ø 0.80 ม."
                subLabel="ขนาดท่อ 0.80 ม."
                field="basin080Price"
                unit="บ./ชุด"
                cost={costsInput.basin080Price}
                price={pricesInput.basin080Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="basin100Price"
                label="บ่อพัก Ø 1.00 ม."
                subLabel="ขนาดท่อ 1.00 ม."
                field="basin100Price"
                unit="บ./ชุด"
                cost={costsInput.basin100Price}
                price={pricesInput.basin100Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
              <PriceCostMarkupItem
                idPrefix="basin120Price"
                label="บ่อพัก Ø 1.20 ม."
                subLabel="ขนาดท่อ 1.20 ม."
                field="basin120Price"
                unit="บ./ชุด"
                cost={costsInput.basin120Price}
                price={pricesInput.basin120Price}
                onCostChange={onCostChange}
                onMarkupChange={onMarkupChange}
                onPriceChange={onPriceChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
