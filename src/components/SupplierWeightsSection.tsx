import React from "react";
import { Weights, CustomProduct } from "../types";
import { Scale, Package, Sparkles } from "lucide-react";

interface SupplierWeightsSectionProps {
  weightsInput: Weights;
  customProducts?: CustomProduct[];
  onWeightChange: (field: keyof Weights, val: number) => void;
  onCustomWeightChange?: (id: string, val: number) => void;
}

export function SupplierWeightsSection({
  weightsInput,
  customProducts = [],
  onWeightChange,
  onCustomWeightChange,
}: SupplierWeightsSectionProps) {
  return (
    <div className="bg-neutral-50/40 rounded-2xl p-5 border border-neutral-200/80 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
            <Scale size={16} />
          </div>
          <div>
            <h4 className="font-bold text-neutral-800 text-base">พิกัดน้ำหนักจริงของซัพพลายเออร์นี้ (กก.)</h4>
            <p className="text-xs text-neutral-400">ใช้สำหรับวิเคราะห์การรับน้ำหนักรถบรรทุกและจัดสรรเที่ยวรถอัตโนมัติ</p>
          </div>
        </div>

        {customProducts.length > 0 && (
          <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
            สินค้ากำหนดเอง {customProducts.length} รายการ
          </span>
        )}
      </div>

      {/* Custom Products Weights Section (if any) */}
      {customProducts.length > 0 && (
        <div className="bg-purple-50/40 rounded-2xl p-4 border border-purple-200/70 space-y-3">
          <div className="flex items-center gap-2">
            <Package size={15} className="text-purple-600" />
            <h5 className="font-extrabold text-xs text-purple-900 uppercase tracking-wide">
              พิกัดน้ำหนักสินค้าสั่งทำ / กำหนดเอง (กก. ต่อหน่วย)
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {customProducts.map((p) => (
              <div key={p.id} className="bg-white p-3 rounded-xl border border-purple-200/60 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800 truncate" title={p.name}>
                    {p.name}
                  </span>
                  <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-mono">
                    {p.weightUnit || "กก./ชิ้น"}
                  </span>
                </div>
                {p.subLabel && <p className="text-[10px] text-neutral-400 truncate">{p.subLabel}</p>}
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={p.weight || ""}
                    onChange={(e) => {
                      if (onCustomWeightChange) {
                        onCustomWeightChange(p.id, Math.max(0, parseFloat(e.target.value) || 0));
                      }
                    }}
                    placeholder="0.0"
                    className="w-full bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-purple-400 py-1 px-2.5 rounded-lg text-xs font-bold font-mono text-neutral-800 outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 font-medium">
                    กก.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* 1. Slab, Fence, Hex */}
        <div className="sm:col-span-2 md:col-span-3 border-b border-dashed border-neutral-200 py-1.5">
          <span className="text-xs font-extrabold text-neutral-500 uppercase tracking-wide">
            แผ่นพื้น & เสารั้ว & เสาหกเหลี่ยม (กก./เมตร หรือ กก./ตร.ม.)
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">แผ่นพื้นสำเร็จรูป (กก./ตร.ม. หรือ ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.slab}
            onChange={(e) => onWeightChange("slab", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสาเข็มหกเหลี่ยมกลวง (กก./เมตร)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.hex}
            onChange={(e) => onWeightChange("hex", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสารั้ว 3 นิ้ว (กก./ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.fence3}
            onChange={(e) => onWeightChange("fence3", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสารั้ว 4 นิ้ว (กก./ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.fence4}
            onChange={(e) => onWeightChange("fence4", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        {/* 2. I-piles weight */}
        <div className="sm:col-span-2 md:col-span-3 border-b border-dashed border-neutral-200 py-1.5 pt-3">
          <span className="text-xs font-extrabold text-neutral-500 uppercase tracking-wide">
            น้ำหนักเสาเข็ม I-Shape (กก./เมตร)
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสาไอ I-15 (กก./ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.i15}
            onChange={(e) => onWeightChange("i15", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">I-18 (ธรรมดา / มอก.)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              value={weightsInput.i18_no_tis}
              onChange={(e) => onWeightChange("i18_no_tis", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-2 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.i18_tis}
              onChange={(e) => onWeightChange("i18_tis", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-2 rounded text-xs font-mono text-center text-[#C62828] font-bold"
              placeholder="มอก."
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">I-22 (ธรรมดา / มอก.)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              value={weightsInput.i22_no_tis}
              onChange={(e) => onWeightChange("i22_no_tis", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-2 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.i22_tis}
              onChange={(e) => onWeightChange("i22_tis", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-2 rounded text-xs font-mono text-center text-[#C62828] font-bold"
              placeholder="มอก."
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">I-26 (ธรรมดา / มอก.)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              value={weightsInput.i26_no_tis}
              onChange={(e) => onWeightChange("i26_no_tis", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-2 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.i26_tis}
              onChange={(e) => onWeightChange("i26_tis", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-2 rounded text-xs font-mono text-center text-[#C62828] font-bold"
              placeholder="มอก."
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">I-30 (ธรรมดา / มอก.)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              value={weightsInput.i30_no_tis}
              onChange={(e) => onWeightChange("i30_no_tis", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-2 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.i30_tis}
              onChange={(e) => onWeightChange("i30_tis", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-2 rounded text-xs font-mono text-center text-[#C62828] font-bold"
              placeholder="มอก."
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสาไอ I-35 มอก. (กก./ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.i35}
            onChange={(e) => onWeightChange("i35", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสาไอ I-40 มอก. (กก./ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.i40}
            onChange={(e) => onWeightChange("i40", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        {/* 3. S-Piles Weight */}
        <div className="sm:col-span-2 md:col-span-3 border-b border-dashed border-neutral-200 py-1.5 pt-3">
          <span className="text-xs font-extrabold text-neutral-500 uppercase tracking-wide">
            น้ำหนักเสาสี่เหลี่ยมตัน S-Shape (กก./เมตร)
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสาตัน S-18 (กก./ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.s18}
            onChange={(e) => onWeightChange("s18", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสาตัน S-22 (กก./ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.s22}
            onChange={(e) => onWeightChange("s22", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสาตัน S-26 (กก./ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.s26}
            onChange={(e) => onWeightChange("s26", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสาตัน S-30 (กก./ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.s30}
            onChange={(e) => onWeightChange("s30", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสาตัน S-35 (กก./ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.s35}
            onChange={(e) => onWeightChange("s35", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">เสาตัน S-40 (กก./ม.)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.s40}
            onChange={(e) => onWeightChange("s40", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        {/* 4. Pipes Weight */}
        <div className="sm:col-span-2 md:col-span-3 border-b border-dashed border-neutral-200 py-1.5 pt-3">
          <span className="text-xs font-extrabold text-neutral-500 uppercase tracking-wide">
            น้ำหนักท่อระบายน้ำ คสล. (กก./ท่อน)
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">ท่อ Ø 0.30 ม. (ธรรมดา / มอก.3 / มอก.2)</label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe030Weight}
              onChange={(e) => onWeightChange("pipe030Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe030T3Weight}
              onChange={(e) => onWeightChange("pipe030T3Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.3"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe030T2Weight}
              onChange={(e) => onWeightChange("pipe030T2Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">ท่อ Ø 0.40 ม. (ธรรมดา / มอก.3 / มอก.2)</label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe040Weight}
              onChange={(e) => onWeightChange("pipe040Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe040T3Weight}
              onChange={(e) => onWeightChange("pipe040T3Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.3"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe040T2Weight}
              onChange={(e) => onWeightChange("pipe040T2Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">ท่อ Ø 0.50 ม. (ธรรมดา / มอก.3 / มอก.2)</label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe050Weight}
              onChange={(e) => onWeightChange("pipe050Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe050T3Weight}
              onChange={(e) => onWeightChange("pipe050T3Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.3"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe050T2Weight}
              onChange={(e) => onWeightChange("pipe050T2Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">ท่อ Ø 0.60 ม. (ธรรมดา / มอก.3 / มอก.2)</label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe060Weight}
              onChange={(e) => onWeightChange("pipe060Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe060T3Weight}
              onChange={(e) => onWeightChange("pipe060T3Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.3"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe060T2Weight}
              onChange={(e) => onWeightChange("pipe060T2Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">ท่อ Ø 0.80 ม. (ธรรมดา / มอก.3 / มอก.2)</label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe080Weight}
              onChange={(e) => onWeightChange("pipe080Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe080T3Weight}
              onChange={(e) => onWeightChange("pipe080T3Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.3"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe080T2Weight}
              onChange={(e) => onWeightChange("pipe080T2Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">ท่อ Ø 1.00 ม. (ธรรมดา / มอก.3 / มอก.2)</label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe100Weight}
              onChange={(e) => onWeightChange("pipe100Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe100T3Weight}
              onChange={(e) => onWeightChange("pipe100T3Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.3"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe100T2Weight}
              onChange={(e) => onWeightChange("pipe100T2Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">ท่อ Ø 1.20 ม. (ธรรมดา / มอก.3 / มอก.2)</label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe120Weight}
              onChange={(e) => onWeightChange("pipe120Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe120T3Weight}
              onChange={(e) => onWeightChange("pipe120T3Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.3"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe120T2Weight}
              onChange={(e) => onWeightChange("pipe120T2Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">ท่อ Ø 1.50 ม. (ธรรมดา / มอก.3 / มอก.2)</label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe150Weight}
              onChange={(e) => onWeightChange("pipe150Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="ธรรมดา"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe150T3Weight}
              onChange={(e) => onWeightChange("pipe150T3Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.3"
            />
            <input
              type="number"
              step="0.1"
              value={weightsInput.pipe150T2Weight}
              onChange={(e) => onWeightChange("pipe150T2Weight", Math.max(0, parseFloat(e.target.value) || 0))}
              className="bg-white border border-neutral-200 py-1 px-1.5 rounded text-xs font-mono text-center"
              placeholder="มอก.2"
            />
          </div>
        </div>

        {/* 5. Basins Weight */}
        <div className="sm:col-span-2 md:col-span-3 border-b border-dashed border-neutral-200 py-1.5 pt-3">
          <span className="text-xs font-extrabold text-neutral-500 uppercase tracking-wide">
            น้ำหนักบ่อพัก คสล. (กก./ชุด)
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">บ่อพัก 0.30 ม. (กก./ชุด)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.basin030Weight}
            onChange={(e) => onWeightChange("basin030Weight", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">บ่อพัก 0.40 ม. (กก./ชุด)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.basin040Weight}
            onChange={(e) => onWeightChange("basin040Weight", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">บ่อพัก 0.50 ม. (กก./ชุด)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.basin050Weight}
            onChange={(e) => onWeightChange("basin050Weight", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">บ่อพัก 0.60 ม. (กก./ชุด)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.basin060Weight}
            onChange={(e) => onWeightChange("basin060Weight", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">บ่อพัก 0.80 ม. (กก./ชุด)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.basin080Weight}
            onChange={(e) => onWeightChange("basin080Weight", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600">บ่อพัก 1.00 ม. (กก./ชุด)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.basin100Weight}
            onChange={(e) => onWeightChange("basin100Weight", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-3">
          <label className="text-xs font-semibold text-neutral-600">บ่อพัก 1.20 ม. (กก./ชุด)</label>
          <input
            type="number"
            step="0.1"
            value={weightsInput.basin120Weight}
            onChange={(e) => onWeightChange("basin120Weight", Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-white border border-neutral-200 py-1.5 px-3 rounded-lg text-sm font-semibold font-mono"
          />
        </div>
      </div>
    </div>
  );
}
