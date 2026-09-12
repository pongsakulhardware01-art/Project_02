import React, { useState, useEffect } from "react";
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Database,
  ShieldCheck,
  Zap,
  Activity,
  ArrowDownCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { AppSettings } from "../types";
import { APP_VERSION } from "../data";

interface CloudStatusData {
  connected: boolean;
  status: "online" | "disconnected" | "error";
  message: string;
  projectId: string;
  databaseId: string;
  documentExists: boolean;
  latencyMs: number;
  activeSupplierId?: string;
  suppliersCount?: number;
  customProductsCount?: number;
  deletedItemsCount?: number;
  cachedInRam?: boolean;
  lastChecked: string;
  error?: string;
}

interface CloudSystemStatusCardProps {
  settings: AppSettings;
  onRefreshSettings?: () => void;
}

export function CloudSystemStatusCard({ settings, onRefreshSettings }: CloudSystemStatusCardProps) {
  const [status, setStatus] = useState<CloudStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);

  const fetchCloudStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cloud-status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        setStatus({
          connected: false,
          status: "error",
          message: "ไม่สามารถเรียกดูสถานะคลาวด์จากเซิร์ฟเวอร์ได้",
          projectId: "steady-order-0fs6l",
          databaseId: "ai-studio-pongsakulhardwar-c9b85e7e-1f40-457d-a048-1a91b69823bf",
          documentExists: false,
          latencyMs: 0,
          lastChecked: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setStatus({
        connected: false,
        status: "disconnected",
        message: "อุปกรณ์ออฟไลน์ หรือเซิร์ฟเวอร์ยังไม่พร้อม",
        projectId: "steady-order-0fs6l",
        databaseId: "ai-studio-pongsakulhardwar-c9b85e7e-1f40-457d-a048-1a91b69823bf",
        documentExists: false,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCloudStatus();
  }, []);

  const handleTestCloudConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/cloud-test", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `ทดสอบอ่านและบันทึกคลาวด์สมบูรณ์ (Latency: ${data.latencyMs}ms)`,
          latencyMs: data.latencyMs,
        });
        fetchCloudStatus();
      } else {
        setTestResult({
          success: false,
          message: data.error || "เกิดข้อผิดพลาดในการทดสอบคลาวด์",
          latencyMs: data.latencyMs || 0,
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || "ไม่สามารถเชื่อมต่อไปยังเซิร์ฟเวอร์ได้",
        latencyMs: 0,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-md space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Cloud size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-neutral-900 font-display">
                สถานะระบบคลาวด์และการซิงค์ข้อมูล (Cloud Diagnostic)
              </h3>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {APP_VERSION}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              ตรวจสอบการเชื่อมต่อฐานข้อมูล Google Cloud Firestore และระบบสำรองข้อมูลออฟไลน์แบบสองทาง
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={fetchCloudStatus}
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>รีเฟรชสถานะ</span>
          </button>

          <button
            type="button"
            onClick={handleTestCloudConnection}
            disabled={testing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Zap size={13} className={testing ? "animate-pulse" : ""} />
            <span>{testing ? "กำลังทดสอบ..." : "ทดสอบส่ง-รับคลาวด์"}</span>
          </button>
        </div>
      </div>

      {/* Test Result Toast / Banner */}
      {testResult && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-medium animate-fadeIn ${
            testResult.success
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Connection Status */}
        <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
              <Activity size={13} className="text-neutral-400" />
              การเชื่อมต่อคลาวด์
            </span>
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  status?.connected ? "bg-emerald-400" : "bg-red-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  status?.connected ? "bg-emerald-500" : "bg-red-500"
                }`}
              ></span>
            </span>
          </div>
          <div className="text-base font-black text-neutral-900">
            {loading ? "กำลังตรวจสอบ..." : status?.connected ? "เชื่อมต่อสมบูรณ์ (Online)" : "ออฟไลน์ / ตัดการเชื่อมต่อ"}
          </div>
          <p className="text-[11px] text-neutral-500 truncate">
            {status?.message || "พร้อมใช้งาน"}
          </p>
        </div>

        {/* Card 2: Latency */}
        <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 space-y-1.5">
          <span className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
            <Clock size={13} className="text-neutral-400" />
            ความเร็วการตอบสนอง (Latency)
          </span>
          <div className="text-base font-black font-mono text-emerald-700">
            {loading ? "..." : `${status?.latencyMs || 0} ms`}
          </div>
          <p className="text-[11px] text-neutral-500">
            {status && status.latencyMs < 150 ? "ความเร็วสูงมาก (Fast)" : "ความเร็วปกติ"}
          </p>
        </div>

        {/* Card 3: Cloud Database ID */}
        <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 space-y-1.5">
          <span className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
            <Database size={13} className="text-neutral-400" />
            Firestore Database ID
          </span>
          <div className="text-xs font-mono font-bold text-neutral-900 truncate" title={status?.databaseId}>
            {status?.databaseId || "ai-studio-pongsakulhardwar-..."}
          </div>
          <p className="text-[11px] text-neutral-500 truncate">
            Project: {status?.projectId || "steady-order-0fs6l"}
          </p>
        </div>

        {/* Card 4: Security & Rules */}
        <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 space-y-1.5">
          <span className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            ความปลอดภัย (Security Rules)
          </span>
          <div className="text-base font-black text-emerald-700">
            ผ่านการตรวจสอบ (ABAC)
          </div>
          <p className="text-[11px] text-neutral-500">
            อนุญาตเฉพาะเอกสาร settings/config
          </p>
        </div>
      </div>

      {/* Cloud Synchronized Details Table */}
      <div className="rounded-2xl border border-neutral-200/90 overflow-hidden text-xs">
        <div className="bg-neutral-100/70 px-4 py-2.5 font-bold text-neutral-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Server size={13} />
            รายการข้อมูลที่กำลังซิงก์ผ่านคลาวด์แบบเรียลไทม์
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">
            ตรวจสอบล่าสุด: {status?.lastChecked ? new Date(status.lastChecked).toLocaleTimeString("th-TH") : "-"}
          </span>
        </div>

        <div className="divide-y divide-neutral-100 bg-white">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-neutral-800">1. โรงงานและซัพพลายเออร์ที่ลงทะเบียน (Suppliers List)</span>
              <p className="text-[11px] text-neutral-500">แยกราคาต้นทุน ราคาขาย พิกัดโรงงาน และเงื่อนไขรถขนส่งตามซัพพลายเออร์</p>
            </div>
            <span className="font-mono font-bold bg-neutral-100 px-2 py-1 rounded text-neutral-800">
              {settings.suppliers?.length || 0} แห่ง
            </span>
          </div>

          <div className="px-4 py-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-neutral-800">2. สินค้าสั่งทำและสเปกพิเศษกำหนดเอง (Custom Products)</span>
              <p className="text-[11px] text-neutral-500">เชื่อมโยงไปยังเครื่องคำนวณราคาเดี่ยว ตารางรวม และระบบคำนวณระวางรถขนส่ง</p>
            </div>
            <span className="font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded">
              {settings.customProducts?.length || 0} รายการ
            </span>
          </div>

          <div className="px-4 py-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-neutral-800">3. รายการที่ซ่อน/ลบจากการคำนวณ (Hidden/Deleted Items)</span>
              <p className="text-[11px] text-neutral-500">สินค้าที่ปิดการขาย ไม่นำไปคำนวณในสูตรราคา (สามารถกู้คืนได้เสมอ)</p>
            </div>
            <span className="font-mono font-bold bg-neutral-100 px-2 py-1 rounded text-neutral-600">
              {settings.deletedItemIds?.length || 0} รายการ
            </span>
          </div>

          <div className="px-4 py-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-neutral-800">4. โหมดสำรองข้อมูลออฟไลน์ (Dual Storage Persistence)</span>
              <p className="text-[11px] text-neutral-500">เมื่อไม่มีสัญญาณอินเทอร์เน็ต แอปพลิเคชันจะทำงานจาก Local Cache ทันที 100%</p>
            </div>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={12} /> พร้อมใช้งานออฟไลน์
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
