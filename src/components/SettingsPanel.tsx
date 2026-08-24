import React, { useRef, useState, useEffect } from "react";
import { AppSettings, Prices, Weights, SupplierProfile, SupplierLocation, DeliveryConfig, DistanceTier, SupplierTruck, MinOrderCriteriaType } from "../types";
import { defaultSettings, defaultPrices, defaultCosts, defaultWeights, defaultSuppliers, defaultDistanceTiers, defaultSupplierTrucks, APP_VERSION } from "../data";
import { fmt } from "../utils";
import { parseGoogleMapsInput, isValidLatLng, PRESET_LOCATIONS, createGoogleMapsDirectionsUrl } from "../utils/geoUtils";
import { PriceCostMarkupItem } from "./PriceCostMarkupCard";
import { BulkMarkupToolbar } from "./BulkMarkupToolbar";
import { SupplierPricingSection } from "./SupplierPricingSection";
import { SupplierWeightsSection } from "./SupplierWeightsSection";
import html2canvas from "html2canvas";
import {
  Save,
  RotateCcw,
  Image,
  Settings,
  Percent,
  DollarSign,
  Scale,
  CheckCircle2,
  Download,
  Plus,
  Trash2,
  Copy,
  Building2,
  Factory,
  Edit3,
  Check,
  MapPin,
  Phone,
  Info,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Layers,
  Truck,
  Navigation,
  Compass,
  TrendingUp,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsPanelProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export default function SettingsPanel({ settings, setSettings }: SettingsPanelProps) {
  // Ensure suppliers list is always valid
  const currentSuppliers: SupplierProfile[] = (settings.suppliers && settings.suppliers.length > 0)
    ? settings.suppliers
    : defaultSuppliers;

  // Selected supplier in settings panel (the one being viewed/edited)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    settings.activeSupplierId || currentSuppliers[0]?.id || "pongsakul_main"
  );

  const currentSupplier = currentSuppliers.find((s) => s.id === selectedSupplierId) || currentSuppliers[0];

  // Form states for the selected supplier's profile, prices, costs, and weights
  const [supplierName, setSupplierName] = useState<string>(currentSupplier?.name || "พงษ์สกุลฮาร์ดแวร์ (โรงงานหลัก)");
  const [supplierCode, setSupplierCode] = useState<string>(currentSupplier?.code || "PS-01");
  const [supplierDesc, setSupplierDesc] = useState<string>(currentSupplier?.description || "");
  const [pricesInput, setPricesInput] = useState<Prices>({ ...(currentSupplier?.prices || settings.prices || defaultPrices) });
  const [costsInput, setCostsInput] = useState<Prices>({ ...(currentSupplier?.costs || settings.costs || defaultCosts) });
  const [weightsInput, setWeightsInput] = useState<Weights>({ ...(currentSupplier?.weights || settings.weights || defaultWeights) });

  // Tab state between Prices (with Cost & Markup) and Weights
  const [activePriceWeightTab, setActivePriceWeightTab] = useState<"prices" | "weights">("prices");

  // Location & Google Maps States
  const [supplierAddress, setSupplierAddress] = useState<string>(
    currentSupplier?.supplierLocation?.address || currentSupplier?.location || "125 หมู่ 4 ต.ท่าทราย อ.เมือง จ.สมุทรสาคร 74000"
  );
  const [supplierMapsUrl, setSupplierMapsUrl] = useState<string>(
    currentSupplier?.supplierLocation?.mapsUrl || "https://maps.google.com/?q=13.5475,100.2745"
  );
  const [supplierLat, setSupplierLat] = useState<number | undefined>(
    currentSupplier?.supplierLocation?.lat ?? 13.5475
  );
  const [supplierLng, setSupplierLng] = useState<number | undefined>(
    currentSupplier?.supplierLocation?.lng ?? 100.2745
  );

  // Delivery Policy States
  const [distanceTiers, setDistanceTiers] = useState<DistanceTier[]>(() => {
    return currentSupplier?.deliveryConfig?.distanceTiers && currentSupplier.deliveryConfig.distanceTiers.length > 0
      ? currentSupplier.deliveryConfig.distanceTiers
      : defaultDistanceTiers;
  });
  const [excessRatePerKm, setExcessRatePerKm] = useState<number>(
    currentSupplier?.deliveryConfig?.excessRatePerKm ?? 35
  );
  const [pricingMode, setPricingMode] = useState<"tiered" | "per_km">(
    currentSupplier?.deliveryConfig?.pricingMode ?? "tiered"
  );
  const [freeRadiusKm, setFreeRadiusKm] = useState<number>(
    currentSupplier?.deliveryConfig?.freeRadiusKm ?? 30
  );
  const [ratePerKm, setRatePerKm] = useState<number>(
    currentSupplier?.deliveryConfig?.ratePerKm ?? 25
  );
  const [basePrice, setBasePrice] = useState<number>(
    currentSupplier?.deliveryConfig?.basePrice ?? 0
  );
  const [minOrderFreeAmount, setMinOrderFreeAmount] = useState<number>(
    currentSupplier?.deliveryConfig?.minOrderFreeAmount ?? 0
  );

  // Truck Fleet & Capacity States
  const [availableTrucks, setAvailableTrucks] = useState<SupplierTruck[]>(() => {
    return currentSupplier?.deliveryConfig?.availableTrucks && currentSupplier.deliveryConfig.availableTrucks.length > 0
      ? currentSupplier.deliveryConfig.availableTrucks
      : defaultSupplierTrucks;
  });
  const [minOrderCriteria, setMinOrderCriteria] = useState<MinOrderCriteriaType>(
    currentSupplier?.deliveryConfig?.minOrderCriteria || "full_truckload_96"
  );
  const [fullLoadThresholdPercent, setFullLoadThresholdPercent] = useState<number>(
    currentSupplier?.deliveryConfig?.fullLoadThresholdPercent ?? 96
  );
  const [minWeightKg, setMinWeightKg] = useState<number>(
    currentSupplier?.deliveryConfig?.minWeightKg ?? 0
  );

  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // Sync inputs when selected supplier changes
  useEffect(() => {
    const sup = currentSuppliers.find((s) => s.id === selectedSupplierId) || currentSuppliers[0];
    if (sup) {
      setSupplierName(sup.name);
      setSupplierCode(sup.code || "");
      setSupplierDesc(sup.description || "");
      setPricesInput({ ...(sup.prices || defaultPrices) });
      setCostsInput({ ...(sup.costs || defaultCosts) });
      setWeightsInput({ ...(sup.weights || defaultWeights) });
      setSupplierAddress(sup.supplierLocation?.address || sup.location || "");
      setSupplierMapsUrl(sup.supplierLocation?.mapsUrl || "");
      setSupplierLat(sup.supplierLocation?.lat ?? 13.5475);
      setSupplierLng(sup.supplierLocation?.lng ?? 100.2745);

      const tiers = sup.deliveryConfig?.distanceTiers && sup.deliveryConfig.distanceTiers.length > 0
        ? sup.deliveryConfig.distanceTiers
        : defaultDistanceTiers;
      setDistanceTiers(tiers);
      setExcessRatePerKm(sup.deliveryConfig?.excessRatePerKm ?? 35);
      setPricingMode(sup.deliveryConfig?.pricingMode ?? "tiered");
      setFreeRadiusKm(sup.deliveryConfig?.freeRadiusKm ?? 30);
      setRatePerKm(sup.deliveryConfig?.ratePerKm ?? 25);
      setBasePrice(sup.deliveryConfig?.basePrice ?? 0);
      setMinOrderFreeAmount(sup.deliveryConfig?.minOrderFreeAmount ?? 0);

      const trucks = sup.deliveryConfig?.availableTrucks && sup.deliveryConfig.availableTrucks.length > 0
        ? sup.deliveryConfig.availableTrucks
        : defaultSupplierTrucks;
      setAvailableTrucks(trucks);
      setMinOrderCriteria(sup.deliveryConfig?.minOrderCriteria || "full_truckload_96");
      setFullLoadThresholdPercent(sup.deliveryConfig?.fullLoadThresholdPercent ?? 96);
      setMinWeightKg(sup.deliveryConfig?.minWeightKg ?? 0);
    }
  }, [selectedSupplierId]);

  // Instant Location Update Handler (immediately updates state, settings, and cloud sync)
  const handleInstantLocationUpdate = (
    nextAddr: string,
    nextLat: number | undefined,
    nextLng: number | undefined,
    nextMapsUrl: string,
    noticeText?: string
  ) => {
    setSupplierAddress(nextAddr);
    setSupplierLat(nextLat);
    setSupplierLng(nextLng);
    setSupplierMapsUrl(nextMapsUrl);

    if (noticeText) {
      setLocationNotice(noticeText);
      setTimeout(() => setLocationNotice(null), 3000);
    }

    const updatedLocation: SupplierLocation = {
      address: nextAddr.trim() || "ต.ท่าทราย อ.เมือง จ.สมุทรสาคร",
      mapsUrl: nextMapsUrl.trim(),
      lat: nextLat,
      lng: nextLng,
      placeName: supplierName.trim(),
    };

    const updatedDeliveryConfig: DeliveryConfig = {
      pricingMode,
      distanceTiers,
      excessRatePerKm,
      freeRadiusKm: Number(freeRadiusKm) || 0,
      ratePerKm: Number(ratePerKm) || 0,
      basePrice: Number(basePrice) || 0,
      minOrderFreeAmount: Number(minOrderFreeAmount) || 0,
      minOrderCriteria,
      fullLoadThresholdPercent,
      minWeightKg,
      availableTrucks,
    };

    const updatedSuppliersList = currentSuppliers.map((s) => {
      if (s.id === selectedSupplierId) {
        return {
          ...s,
          location: nextAddr.trim(),
          supplierLocation: updatedLocation,
          deliveryConfig: updatedDeliveryConfig,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    const activeObj = updatedSuppliersList.find((s) => s.id === settings.activeSupplierId) || updatedSuppliersList[0];

    const updatedSettings: AppSettings = {
      ...settings,
      suppliers: updatedSuppliersList,
      prices: activeObj.prices,
      costs: activeObj.costs,
      weights: activeObj.weights,
    };

    setSettings(updatedSettings);
    localStorage.setItem("pongsakulSettings", JSON.stringify(updatedSettings));

    // Non-blocking sync to server
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    }).catch(() => {});
  };

  // Comprehensive Instant Delivery Config Update Handler
  const handleInstantDeliveryConfigUpdate = (
    nextTiers: DistanceTier[],
    nextExcessRate: number,
    nextMinOrder: number,
    nextMode: "tiered" | "per_km" = pricingMode,
    nextTrucks: SupplierTruck[] = availableTrucks,
    nextCriteria: MinOrderCriteriaType = minOrderCriteria,
    nextThreshold: number = fullLoadThresholdPercent,
    nextMinWeight: number = minWeightKg
  ) => {
    setDistanceTiers(nextTiers);
    setExcessRatePerKm(nextExcessRate);
    setMinOrderFreeAmount(nextMinOrder);
    setPricingMode(nextMode);
    setAvailableTrucks(nextTrucks);
    setMinOrderCriteria(nextCriteria);
    setFullLoadThresholdPercent(nextThreshold);
    setMinWeightKg(nextMinWeight);

    // Compute free radius from tier 0 if price is 0
    const freeTier = nextTiers.find((t) => t.price === 0);
    const computedFreeRadius = freeTier ? freeTier.maxKm : 0;
    setFreeRadiusKm(computedFreeRadius);

    const updatedLocation: SupplierLocation = {
      address: supplierAddress.trim() || "ต.ท่าทราย อ.เมือง จ.สมุทรสาคร",
      mapsUrl: supplierMapsUrl.trim(),
      lat: supplierLat,
      lng: supplierLng,
      placeName: supplierName.trim(),
    };

    const updatedDeliveryConfig: DeliveryConfig = {
      pricingMode: nextMode,
      distanceTiers: nextTiers,
      excessRatePerKm: nextExcessRate,
      freeRadiusKm: computedFreeRadius,
      ratePerKm: nextExcessRate,
      basePrice: 0,
      minOrderFreeAmount: nextMinOrder,
      minOrderCriteria: nextCriteria,
      fullLoadThresholdPercent: nextThreshold,
      minWeightKg: nextMinWeight,
      availableTrucks: nextTrucks,
    };

    const updatedSuppliersList = currentSuppliers.map((s) => {
      if (s.id === selectedSupplierId) {
        return {
          ...s,
          supplierLocation: updatedLocation,
          deliveryConfig: updatedDeliveryConfig,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    const activeObj = updatedSuppliersList.find((s) => s.id === settings.activeSupplierId) || updatedSuppliersList[0];

    const updatedSettings: AppSettings = {
      ...settings,
      suppliers: updatedSuppliersList,
      prices: activeObj.prices,
      costs: activeObj.costs,
      weights: activeObj.weights,
    };

    setSettings(updatedSettings);
    localStorage.setItem("pongsakulSettings", JSON.stringify(updatedSettings));

    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    }).catch(() => {});
  };

  // Instant Delivery Tier Update Handler (backward compatible)
  const handleInstantDeliveryTierUpdate = (
    nextTiers: DistanceTier[],
    nextExcessRate: number,
    nextMinOrder: number,
    nextMode: "tiered" | "per_km" = "tiered"
  ) => {
    handleInstantDeliveryConfigUpdate(
      nextTiers,
      nextExcessRate,
      nextMinOrder,
      nextMode,
      availableTrucks,
      minOrderCriteria,
      fullLoadThresholdPercent,
      minWeightKg
    );
  };

  // Toggle Truck Enabled status
  const handleToggleTruck = (truckId: string) => {
    const nextTrucks = availableTrucks.map((t) =>
      t.id === truckId ? { ...t, enabled: !t.enabled } : t
    );
    handleInstantDeliveryConfigUpdate(
      distanceTiers,
      excessRatePerKm,
      minOrderFreeAmount,
      pricingMode,
      nextTrucks,
      minOrderCriteria,
      fullLoadThresholdPercent,
      minWeightKg
    );
  };

  // Update Truck Capacity or Name
  const handleUpdateTruck = (truckId: string, field: "name" | "capacityKg", val: any) => {
    const nextTrucks = availableTrucks.map((t) => {
      if (t.id === truckId) {
        const updated = { ...t, [field]: val };
        if (field === "capacityKg") {
          const cap = Math.max(0, Number(val) || 0);
          updated.capacityKg = cap;
          updated.label = `${(cap / 1000).toFixed(1)} ตัน`;
        }
        return updated;
      }
      return t;
    });
    handleInstantDeliveryConfigUpdate(
      distanceTiers,
      excessRatePerKm,
      minOrderFreeAmount,
      pricingMode,
      nextTrucks,
      minOrderCriteria,
      fullLoadThresholdPercent,
      minWeightKg
    );
  };

  // Add Custom Truck Type
  const handleAddTruck = () => {
    const newTruck: SupplierTruck = {
      id: `truck_${Date.now()}`,
      name: "รถบรรทุกสั่งทำพิเศษ",
      capacityKg: 15000,
      label: "15.0 ตัน",
      enabled: true,
    };
    const nextTrucks = [...availableTrucks, newTruck];
    handleInstantDeliveryConfigUpdate(
      distanceTiers,
      excessRatePerKm,
      minOrderFreeAmount,
      pricingMode,
      nextTrucks,
      minOrderCriteria,
      fullLoadThresholdPercent,
      minWeightKg
    );
  };

  // Delete Truck Type
  const handleDeleteTruck = (truckId: string) => {
    if (availableTrucks.length <= 1) return;
    const nextTrucks = availableTrucks.filter((t) => t.id !== truckId);
    handleInstantDeliveryConfigUpdate(
      distanceTiers,
      excessRatePerKm,
      minOrderFreeAmount,
      pricingMode,
      nextTrucks,
      minOrderCriteria,
      fullLoadThresholdPercent,
      minWeightKg
    );
  };

  // Reset Truck Fleet to Defaults
  const handleResetTrucks = () => {
    handleInstantDeliveryConfigUpdate(
      distanceTiers,
      excessRatePerKm,
      minOrderFreeAmount,
      pricingMode,
      defaultSupplierTrucks,
      minOrderCriteria,
      fullLoadThresholdPercent,
      minWeightKg
    );
  };

  // Add new tier with auto-calculated ranges
  const handleAddTier = () => {
    const sorted = [...distanceTiers].sort((a, b) => a.minKm - b.minKm);
    const last = sorted[sorted.length - 1];
    const newMin = last ? last.maxKm + 1 : 0;
    const newMax = last ? last.maxKm + 30 : 30;
    const newPrice = last ? (last.price || 0) + 1500 : 0;

    const newTier: DistanceTier = {
      id: `tier-${Date.now()}`,
      minKm: newMin,
      maxKm: newMax,
      price: newPrice,
    };

    const nextTiers = [...distanceTiers, newTier];
    handleInstantDeliveryTierUpdate(nextTiers, excessRatePerKm, minOrderFreeAmount, pricingMode);
  };

  // Update specific tier field
  const handleUpdateTier = (index: number, field: "minKm" | "maxKm" | "price", val: number) => {
    const nextTiers = distanceTiers.map((t, idx) => {
      if (idx === index) {
        return { ...t, [field]: Math.max(0, val) };
      }
      return t;
    });
    handleInstantDeliveryTierUpdate(nextTiers, excessRatePerKm, minOrderFreeAmount, pricingMode);
  };

  // Delete a tier
  const handleDeleteTier = (index: number) => {
    if (distanceTiers.length <= 1) return;
    const nextTiers = distanceTiers.filter((_, idx) => idx !== index);
    handleInstantDeliveryTierUpdate(nextTiers, excessRatePerKm, minOrderFreeAmount, pricingMode);
  };

  // Reset to standard tiers
  const handleResetTiers = () => {
    handleInstantDeliveryTierUpdate(defaultDistanceTiers, 35, minOrderFreeAmount, "tiered");
  };

  // Handle Google Maps Input Parse for Supplier Location with Instant Update
  const handleParseSupplierLocation = (inputVal: string) => {
    setSupplierMapsUrl(inputVal);
    if (!inputVal.trim()) {
      handleInstantLocationUpdate(supplierAddress, undefined, undefined, inputVal);
      return;
    }

    const parsed = parseGoogleMapsInput(inputVal);
    if (isValidLatLng(parsed.lat, parsed.lng)) {
      const nextAddr = (parsed.address && !supplierAddress) ? parsed.address : supplierAddress;
      handleInstantLocationUpdate(
        nextAddr,
        parsed.lat,
        parsed.lng,
        inputVal,
        `⚡ อัปเดตพิกัดทันที: ${parsed.lat?.toFixed(4)}, ${parsed.lng?.toFixed(4)}`
      );
    } else {
      handleInstantLocationUpdate(supplierAddress, supplierLat, supplierLng, inputVal);
    }
  };

  // Modal for adding a new supplier
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newSupName, setNewSupName] = useState<string>("");
  const [newSupCode, setNewSupCode] = useState<string>("");
  const [newSupDesc, setNewSupDesc] = useState<string>("");
  const [newSupBaseTemplate, setNewSupBaseTemplate] = useState<string>(selectedSupplierId || "default");

  // Notifications & export states
  const [notif, setNotif] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const showNotify = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 4000);
  };

  // Cost, Markup, and Price Change Handlers
  const handleCostChange = (field: keyof Prices, costVal: number) => {
    const currentPrice = pricesInput[field] ?? 0;
    const oldCost = costsInput[field] ?? 0;
    const currentMarkup = Math.max(0, Number((currentPrice - oldCost).toFixed(2)));
    const newPrice = Number((costVal + currentMarkup).toFixed(2));
    
    setCostsInput((prev) => ({ ...prev, [field]: costVal }));
    setPricesInput((prev) => ({ ...prev, [field]: newPrice }));
  };

  const handleMarkupChange = (field: keyof Prices, markupVal: number) => {
    const currentCost = costsInput[field] ?? 0;
    const newPrice = Number((currentCost + markupVal).toFixed(2));
    setPricesInput((prev) => ({ ...prev, [field]: newPrice }));
  };

  const handlePriceChange = (field: keyof Prices, val: number) => {
    setPricesInput((prev) => ({ ...prev, [field]: val }));
  };

  const handleWeightChange = (field: keyof Weights, val: number) => {
    setWeightsInput((prev) => ({ ...prev, [field]: val }));
  };

  // Bulk profit markup tool
  const handleApplyBulkMarkup = (category: string, mode: "fixed" | "percent", value: number) => {
    const isCategoryMatch = (key: keyof Prices): boolean => {
      if (key === "vatPercent") return false;
      if (category === "all") return true;
      if (category === "slabs") return key === "normalBoardPrice" || key === "mocBoardPrice" || key === "hcPriceSqm";
      if (category === "ipiles") return key.startsWith("i");
      if (category === "spiles") return key.startsWith("s");
      if (category === "fences") return key === "hexPilePrice" || key === "fence3Price" || key === "fence4Price";
      if (category === "pipes") return key.startsWith("pipe");
      if (category === "basins") return key.startsWith("basin");
      return false;
    };

    setPricesInput((prevPrices) => {
      const nextPrices = { ...prevPrices };
      (Object.keys(costsInput) as Array<keyof Prices>).forEach((field) => {
        if (field === "vatPercent") return;
        if (isCategoryMatch(field)) {
          const cost = costsInput[field] || 0;
          let added = 0;
          if (mode === "fixed") {
            added = value;
          } else {
            added = Number(((cost * value) / 100).toFixed(2));
          }
          nextPrices[field] = Number((cost + added).toFixed(2));
        }
      });
      return nextPrices;
    });

    showNotify(`ปรับอัตราบวกกำไรของหมวด "${category}" สำเร็จเรียบร้อย! 📈✨`);
  };

  // Switch which supplier is active application-wide
  const handleSetActiveSupplier = async (targetId: string) => {
    const target = currentSuppliers.find((s) => s.id === targetId);
    if (!target) return;

    const updatedSettings: AppSettings = {
      ...settings,
      activeSupplierId: targetId,
      prices: target.prices,
      costs: target.costs,
      weights: target.weights,
      suppliers: currentSuppliers,
    };

    setSettings(updatedSettings);
    localStorage.setItem("pongsakulSettings", JSON.stringify(updatedSettings));

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      showNotify(`สลับใช้งานราคา ต้นทุน และพิกัดน้ำหนักของ "${target.name}" เรียบร้อยแล้ว! 🏢✨`);
    } catch (e) {
      showNotify(`สลับใช้งานราคาของ "${target.name}" ในเครื่องนี้เรียบร้อย`);
    }
  };

  // Add new supplier
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) {
      alert("กรุณากรอกชื่อซัพพลายเออร์ / โรงงาน");
      return;
    }

    // Determine initial rates
    let basePrices = { ...defaultPrices };
    let baseCosts = { ...defaultCosts };
    let baseWeights = { ...defaultWeights };
    let baseLocation: SupplierLocation = {
      address: "ต.ท่าทราย อ.เมือง จ.สมุทรสาคร",
      lat: 13.5475,
      lng: 100.2745,
      mapsUrl: "https://maps.google.com/?q=13.5475,100.2745",
      placeName: newSupName.trim(),
    };
    let baseDelivery: DeliveryConfig = {
      freeRadiusKm: 30,
      ratePerKm: 25,
      basePrice: 0,
      minOrderFreeAmount: 0,
    };

    const baseSup = currentSuppliers.find((s) => s.id === newSupBaseTemplate);
    if (baseSup) {
      basePrices = { ...defaultPrices, ...(baseSup.prices || {}) };
      baseCosts = { ...defaultCosts, ...(baseSup.costs || {}) };
      baseWeights = { ...defaultWeights, ...(baseSup.weights || {}) };
      if (baseSup.supplierLocation) baseLocation = { ...baseSup.supplierLocation };
      if (baseSup.deliveryConfig) baseDelivery = { ...baseSup.deliveryConfig };
    }

    const newId = "sup_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const newProfile: SupplierProfile = {
      id: newId,
      name: newSupName.trim(),
      code: newSupCode.trim() || `SP-${currentSuppliers.length + 1}`,
      description: newSupDesc.trim() || "ซัพพลายเออร์กำหนดเอง",
      isDefault: false,
      supplierLocation: baseLocation,
      deliveryConfig: baseDelivery,
      prices: basePrices,
      costs: baseCosts,
      weights: baseWeights,
      createdAt: new Date().toISOString(),
    };

    const newSuppliersList = [...currentSuppliers, newProfile];
    const updatedSettings: AppSettings = {
      ...settings,
      suppliers: newSuppliersList,
    };

    setSettings(updatedSettings);
    localStorage.setItem("pongsakulSettings", JSON.stringify(updatedSettings));
    setSelectedSupplierId(newId);
    setIsAddModalOpen(false);
    setNewSupName("");
    setNewSupCode("");
    setNewSupDesc("");

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      showNotify(`เพิ่มซัพพลายเออร์ "${newProfile.name}" สำเร็จและซิงก์ขึ้นคลาวด์แล้ว! ➕☁️`);
    } catch (e) {
      showNotify(`เพิ่มซัพพลายเออร์ "${newProfile.name}" สำเร็จในอุปกรณ์นี้`);
    }
  };

  // Clone supplier
  const handleCloneSupplier = async (sourceId: string) => {
    const source = currentSuppliers.find((s) => s.id === sourceId);
    if (!source) return;

    const clonedId = "sup_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const clonedProfile: SupplierProfile = {
      id: clonedId,
      name: `${source.name} (สำเนา)`,
      code: source.code ? `${source.code}-COPY` : `SP-${currentSuppliers.length + 1}`,
      description: source.description ? `${source.description} (คัดลอกข้อมูล)` : "คัดลอกจาก " + source.name,
      isDefault: false,
      supplierLocation: source.supplierLocation ? { ...source.supplierLocation } : undefined,
      deliveryConfig: source.deliveryConfig ? { ...source.deliveryConfig } : undefined,
      prices: { ...source.prices },
      costs: { ...defaultCosts, ...(source.costs || {}) },
      weights: { ...source.weights },
      createdAt: new Date().toISOString(),
    };

    const newSuppliersList = [...currentSuppliers, clonedProfile];
    const updatedSettings: AppSettings = {
      ...settings,
      suppliers: newSuppliersList,
    };

    setSettings(updatedSettings);
    localStorage.setItem("pongsakulSettings", JSON.stringify(updatedSettings));
    setSelectedSupplierId(clonedId);

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      showNotify(`คัดลอกซัพพลายเออร์เป็น "${clonedProfile.name}" สำเร็จ! 📋✨`);
    } catch (e) {
      showNotify(`คัดลอก "${clonedProfile.name}" สำเร็จ`);
    }
  };

  // Delete supplier
  const handleDeleteSupplier = async (targetId: string) => {
    if (currentSuppliers.length <= 1) {
      alert("ไม่สามารถลบซัพพลายเออร์ทั้งหมดได้ ต้องมีอย่างน้อย 1 รายการในระบบ");
      return;
    }

    const target = currentSuppliers.find((s) => s.id === targetId);
    if (!target) return;

    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบซัพพลายเออร์ "${target.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      return;
    }

    const newSuppliersList = currentSuppliers.filter((s) => s.id !== targetId);
    let nextActiveId = settings.activeSupplierId;
    if (nextActiveId === targetId) {
      nextActiveId = newSuppliersList[0].id;
    }

    const activeSupplierObj = newSuppliersList.find((s) => s.id === nextActiveId) || newSuppliersList[0];

    const updatedSettings: AppSettings = {
      activeSupplierId: nextActiveId,
      suppliers: newSuppliersList,
      prices: activeSupplierObj.prices,
      costs: activeSupplierObj.costs,
      weights: activeSupplierObj.weights,
    };

    setSettings(updatedSettings);
    localStorage.setItem("pongsakulSettings", JSON.stringify(updatedSettings));
    setSelectedSupplierId(nextActiveId);

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      showNotify(`ลบซัพพลายเออร์ "${target.name}" เรียบร้อยแล้ว 🗑️`);
    } catch (e) {
      showNotify(`ลบซัพพลายเออร์ในอุปกรณ์นี้เรียบร้อย`);
    }
  };

  // Save current changes to the selected supplier
  const handleSaveCurrentSupplier = async (andActivate = false) => {
    const updatedLocation: SupplierLocation = {
      address: supplierAddress.trim() || "ต.ท่าทราย อ.เมือง จ.สมุทรสาคร",
      mapsUrl: supplierMapsUrl.trim(),
      lat: supplierLat,
      lng: supplierLng,
      placeName: supplierName.trim(),
    };

    const updatedDeliveryConfig: DeliveryConfig = {
      pricingMode,
      distanceTiers,
      excessRatePerKm,
      freeRadiusKm: Number(freeRadiusKm) || 0,
      ratePerKm: Number(ratePerKm) || 0,
      basePrice: Number(basePrice) || 0,
      minOrderFreeAmount: Number(minOrderFreeAmount) || 0,
      minOrderCriteria,
      fullLoadThresholdPercent,
      minWeightKg,
      availableTrucks,
    };

    const updatedSuppliersList = currentSuppliers.map((s) => {
      if (s.id === selectedSupplierId) {
        return {
          ...s,
          name: supplierName.trim() || s.name,
          code: supplierCode.trim() || s.code,
          description: supplierDesc.trim(),
          location: supplierAddress.trim(),
          supplierLocation: updatedLocation,
          deliveryConfig: updatedDeliveryConfig,
          prices: pricesInput,
          costs: costsInput,
          weights: weightsInput,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    const activeId = andActivate ? selectedSupplierId : settings.activeSupplierId;
    const activeObj = updatedSuppliersList.find((s) => s.id === activeId) || updatedSuppliersList[0];

    const updatedSettings: AppSettings = {
      activeSupplierId: activeId,
      suppliers: updatedSuppliersList,
      prices: activeObj.prices,
      costs: activeObj.costs,
      weights: activeObj.weights,
    };

    setSettings(updatedSettings);
    localStorage.setItem("pongsakulSettings", JSON.stringify(updatedSettings));

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      if (response.ok) {
        showNotify(`บันทึกข้อมูล พิกัดที่ตั้ง ต้นทุน และราคาขายของ "${supplierName}" สำเร็จแล้ว! 💾📍☁️`);
      } else {
        showNotify("บันทึกการตั้งค่าในเบราว์เซอร์แล้ว แต่เซิร์ฟเวอร์ยังไม่อัปเกรด ⚠️");
      }
    } catch (e) {
      showNotify("บันทึกการตั้งค่าในเบราว์เซอร์แล้ว 💾");
    }
  };

  const handleDownloadSingleHTML = () => {
    showNotify("กำลังแพ็คแอปพลิเคชันเป็นไฟล์ HTML ชนิดออฟไลน์ ☁️...");
    const link = document.createElement("a");
    link.href = "/api/download-single-html";
    const cleanVersion = APP_VERSION.replace(/\s+/g, "_");
    link.download = `Pongsakul_Concrete_Calculator_${cleanVersion}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetToDefaultOriginal = async () => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการคืนค่าราคา ต้นทุน และน้ำหนักของ "${supplierName}" เป็นราคามาตรฐานโรงงาน?`)) {
      setPricesInput({ ...defaultPrices });
      setCostsInput({ ...defaultCosts });
      setWeightsInput({ ...defaultWeights });

      const updatedSuppliersList = currentSuppliers.map((s) => {
        if (s.id === selectedSupplierId) {
          return {
            ...s,
            prices: { ...defaultPrices },
            costs: { ...defaultCosts },
            weights: { ...defaultWeights },
          };
        }
        return s;
      });

      const activeObj = updatedSuppliersList.find((s) => s.id === settings.activeSupplierId) || updatedSuppliersList[0];

      const updatedSettings: AppSettings = {
        activeSupplierId: settings.activeSupplierId,
        suppliers: updatedSuppliersList,
        prices: activeObj.prices,
        costs: activeObj.costs,
        weights: activeObj.weights,
      };

      setSettings(updatedSettings);
      localStorage.setItem("pongsakulSettings", JSON.stringify(updatedSettings));

      try {
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSettings),
        });
        showNotify(`รีเซ็ตราคา ต้นทุน และน้ำหนักของ "${supplierName}" เป็นมาตรฐานเรียบร้อย! 🔄`);
      } catch (e) {
        showNotify("รีเซ็ตเฉพาะในเบราว์เซอร์เรียบร้อย 🔄");
      }
    }
  };

  const handleExportJpg = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    showNotify(`กำลังสร้างรูปภาพแค็ตตาล็อกราคาของ ${supplierName}... กรุณารอสักครู่ 📸`);

    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const imageURL = canvas.toDataURL("image/jpeg", 0.9);
      const a = document.createElement("a");
      a.href = imageURL;
      const cleanName = supplierName.replace(/[^a-zA-Z0-9ก-๙_-]/g, "_");
      a.download = `Catalog_${cleanName}_${new Date().toISOString().slice(0, 10)}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showNotify(`สร้างไฟล์ JPG สรุปราคาของ ${supplierName} สำเร็จแล้ว! 🎉`);
    } catch (e) {
      console.error(e);
      alert("ไม่สามารถเรนเดอร์ภาพแค็ตตาล็อกได้เนื่องจากข้อจำกัดเฟรมเวิร์ก");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notif && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 z-50 bg-[#C62828] text-white py-3 px-5 rounded-xl shadow-2xl flex items-center gap-2 border border-red-500/30 font-medium">
          <CheckCircle2 size={18} className="text-amber-300 flex-shrink-0 animate-bounce" />
          <span className="text-xs sm:text-sm font-sans">{notif}</span>
        </div>
      )}

      {/* 1. SUPPLIERS MANAGER PANEL */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-md space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 text-[#C62828] rounded-xl">
                <Factory size={22} />
              </div>
              <h3 className="font-extrabold text-neutral-800 text-xl font-display">
                ระบบจัดการซัพพลายเออร์ & แยกการตั้งค่าราคา/น้ำหนัก
              </h3>
            </div>
            <p className="text-neutral-500 text-xs sm:text-sm mt-1.5">
              กำหนดราคาและค่าน้ำหนักแยกตามแต่ละซัพพลายเออร์หรือโรงงานผู้ผลิต เพื่อให้ทุกหน้ารายการคำนวณสามารถเลือกซัพที่ต้องการได้ทันที
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition shrink-0"
          >
            <Plus size={16} />
            <span>เพิ่มซัพพลายเออร์ใหม่</span>
          </button>
        </div>

        {/* Suppliers List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {currentSuppliers.map((sup) => {
            const isSelectedForEditing = sup.id === selectedSupplierId;
            const isActiveForCalc = sup.id === settings.activeSupplierId;

            return (
              <div
                key={sup.id}
                onClick={() => setSelectedSupplierId(sup.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelectedForEditing
                    ? "bg-red-50/40 border-[#C62828] shadow-md ring-2 ring-red-500/20"
                    : "bg-white hover:bg-neutral-50/80 border-neutral-200/70"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-neutral-800 text-sm">{sup.name}</span>
                      {sup.code && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                          {sup.code}
                        </span>
                      )}
                    </div>

                    {isActiveForCalc && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                        <Check size={10} /> ใช้งานหลัก
                      </span>
                    )}
                  </div>

                  {sup.description && (
                    <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2">
                      {sup.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3 text-[11px] text-neutral-600 bg-neutral-100/60 p-2 rounded-lg">
                    <span>แผ่นพื้น: ฿{sup.prices?.normalBoardPrice || 210}/฿{sup.prices?.mocBoardPrice || 230}</span>
                    <span>•</span>
                    <span>นน.แผ่น: {sup.weights?.slab || 42} กก.</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-neutral-100/80">
                  <div className="flex items-center gap-1">
                    {!isActiveForCalc && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetActiveSupplier(sup.id);
                        }}
                        className="text-[11px] font-bold text-neutral-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-neutral-200 transition"
                        title="ตั้งเป็นซัพพลายเออร์ที่เลือกใช้ในการคำนวณทุกหน้า"
                      >
                        เลือกใช้คำนวณ
                      </button>
                    )}
                    {isSelectedForEditing && (
                      <span className="text-[11px] font-bold text-[#C62828] bg-red-100/60 px-2 py-1 rounded-lg">
                        กำลังแก้ไขข้อมูลนี้
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloneSupplier(sup.id);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition"
                      title="คัดลอกเป็นซัพพลายเออร์ใหม่"
                    >
                      <Copy size={14} />
                    </button>
                    {currentSuppliers.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSupplier(sup.id);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="ลบซัพพลายเออร์นี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. ACTIVE SUPPLIER EDITING BANNER & DETAILS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-md space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                กำลังปรับแต่งราคาและน้ำหนักของ:
              </span>
              {selectedSupplierId === settings.activeSupplierId && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Check size={12} /> เป็นซัพพลายเออร์ที่เลือกใช้งานอยู่ในปัจจุบัน
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-neutral-900 text-2xl mt-1">
              {supplierName}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {selectedSupplierId !== settings.activeSupplierId && (
              <button
                type="button"
                onClick={() => handleSetActiveSupplier(selectedSupplierId)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition"
              >
                <Check size={15} />
                <span>ตั้งเป็นซัพพลายเออร์ที่ใช้งาน</span>
              </button>
            )}

            <button
              onClick={handleExportJpg}
              disabled={isExporting}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition"
            >
              <Image size={15} />
              <span>{isExporting ? "กำลังบันทึกภาพ..." : "สร้างรายงานราคา (JPG)"}</span>
            </button>

            <button
              onClick={resetToDefaultOriginal}
              className="flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs sm:text-sm font-bold px-3 py-2.5 rounded-xl border border-neutral-200 transition"
            >
              <RotateCcw size={14} />
              <span>คืนค่าแนะนำ</span>
            </button>
          </div>
        </div>

        {/* Profile Basic Info Inputs */}
        <div className="bg-neutral-50/70 p-4 sm:p-5 rounded-2xl border border-neutral-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">ชื่อซัพพลายเออร์ / โรงงาน *</label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="ระบุชื่อซัพพลายเออร์"
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-800 focus:ring-2 focus:ring-red-500/20 focus:border-[#C62828] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">รหัสย่อ (Code)</label>
            <input
              type="text"
              value={supplierCode}
              onChange={(e) => setSupplierCode(e.target.value)}
              placeholder="เช่น SP-01, PS-RAYONG"
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm font-mono text-neutral-800 focus:ring-2 focus:ring-red-500/20 focus:border-[#C62828] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">คำอธิบาย / โน้ตเพิ่มเติม</label>
            <input
              type="text"
              value={supplierDesc}
              onChange={(e) => setSupplierDesc(e.target.value)}
              placeholder="เช่น สำหรับงานโครงการโซนระยอง, รวมขนส่งแล้ว"
              className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm text-neutral-800 focus:ring-2 focus:ring-red-500/20 focus:border-[#C62828] outline-none"
            />
          </div>
        </div>

        {/* 2.5 LOCATION & GOOGLE MAPS & FREE DELIVERY CONFIGURATION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 bg-gradient-to-br from-neutral-50 to-neutral-100/60 p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          {/* Location & GPS Panel */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-50 text-[#C62828] rounded-lg">
                  <MapPin size={16} />
                </div>
                <h4 className="font-extrabold text-neutral-800 text-sm">
                  📍 ที่ตั้งโรงงาน & พิกัด Google Maps
                </h4>
              </div>

              {isValidLatLng(supplierLat, supplierLng) && (
                <a
                  href={createGoogleMapsDirectionsUrl(supplierLat!, supplierLng!, 13.6265, 100.3956)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition"
                  title="เปิดดูตำแหน่งบน Google Maps"
                >
                  <Compass size={13} />
                  <span>เปิดดูใน Maps ↗</span>
                </a>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  ที่อยู่โรงงาน / ซัพพลายเออร์ (Address)
                </label>
                <input
                  type="text"
                  value={supplierAddress}
                  onChange={(e) => handleInstantLocationUpdate(e.target.value, supplierLat, supplierLng, supplierMapsUrl)}
                  placeholder="เช่น 125 หมู่ 4 ต.ท่าทราย อ.เมือง จ.สมุทรสาคร"
                  className="w-full bg-neutral-50/60 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-800 focus:bg-white focus:ring-1 focus:ring-red-400 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-700 block">
                    ลิงก์ Google Maps หรือ พิกัด (Lat, Lng)
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    รองรับ URL และ ละติจูด,ลองจิจูด (อัปเดตทันที)
                  </span>
                </div>
                <input
                  type="text"
                  value={supplierMapsUrl}
                  onChange={(e) => handleParseSupplierLocation(e.target.value)}
                  placeholder="วางลิงก์ เช่น https://maps.app.goo.gl/... หรือ 13.5475, 100.2745"
                  className="w-full bg-neutral-50/60 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-800 focus:bg-white focus:ring-1 focus:ring-red-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 block mb-0.5">ละติจูด (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={supplierLat ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const nextLat = isNaN(val) ? undefined : val;
                      handleInstantLocationUpdate(supplierAddress, nextLat, supplierLng, supplierMapsUrl);
                    }}
                    placeholder="13.5475"
                    className="w-full bg-neutral-50/60 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-800 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 block mb-0.5">ลองจิจูด (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={supplierLng ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const nextLng = isNaN(val) ? undefined : val;
                      handleInstantLocationUpdate(supplierAddress, supplierLat, nextLng, supplierMapsUrl);
                    }}
                    placeholder="100.2745"
                    className="w-full bg-neutral-50/60 border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-800 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {locationNotice ? (
                <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 animate-pulse flex items-center justify-between">
                  <span>{locationNotice}</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">บันทึกทันที</span>
                </div>
              ) : (
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>⚡ อัปเดตพิกัดทันทีเมื่อมีการเปลี่ยนแปลง (ไม่ต้องรอกดบันทึก)</span>
                </div>
              )}

              {/* Quick Preset Location Selector for Thailand */}
              <div>
                <span className="text-[11px] font-bold text-neutral-500 block mb-1.5">
                  📌 เลือกศูนย์กระจายสินค้า/โซนโรงงานยอดนิยม (อัปเดตทันที):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_LOCATIONS.slice(0, 6).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleInstantLocationUpdate(
                          preset.address,
                          preset.lat,
                          preset.lng,
                          `https://maps.google.com/?q=${preset.lat},${preset.lng}`,
                          `⚡ เลือกพิกัด "${preset.name}" อัปเดตทันทีเรียบร้อยแล้ว`
                        );
                      }}
                      className="text-[10px] font-semibold bg-neutral-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-neutral-700 px-2 py-1 rounded-md border border-neutral-200 transition"
                    >
                      {preset.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Policy Panel - Dynamic Editable Distance Tiers */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                    <Truck size={16} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-neutral-800 text-sm">
                      🚚 นโยบายคิดค่าขนส่งตามช่วงระยะทาง (Distance Tiers)
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      กำหนดราคาตามระยะทางจริง เช่น 31-60 กม. คิด 3,000 บาท
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ⚡ ซิงก์ทันที
                  </span>
                  <button
                    type="button"
                    onClick={handleResetTiers}
                    className="text-[10px] font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-md transition"
                    title="รีเซ็ตเป็นช่วงมาตรฐาน"
                  >
                    🔄 รีเซ็ตช่วง
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-2.5 py-1 rounded-lg shadow-xs transition"
                  >
                    <Plus size={13} />
                    <span>+ เพิ่มช่วงระยะทาง</span>
                  </button>
                </div>
              </div>

              {/* Tiers List */}
              <div className="space-y-2 mt-3 max-h-[290px] overflow-y-auto pr-1">
                {distanceTiers.map((tier, idx) => {
                  const isFree = Number(tier.price) === 0;
                  return (
                    <div
                      key={tier.id || idx}
                      className="bg-neutral-50/80 hover:bg-neutral-50 border border-neutral-200/90 rounded-xl p-2.5 transition flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5"
                    >
                      {/* Tier Label */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-200/70 text-neutral-800">
                          ช่วงที่ {idx + 1}
                        </span>
                      </div>

                      {/* Distance Inputs: min to max */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-[170px]">
                        <span className="text-[11px] text-neutral-500 font-semibold shrink-0">ระยะ:</span>
                        <div className="flex items-center gap-1 w-full">
                          <input
                            type="number"
                            min="0"
                            value={tier.minKm}
                            onChange={(e) =>
                              handleUpdateTier(idx, "minKm", parseFloat(e.target.value) || 0)
                            }
                            className="w-16 sm:w-20 bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-neutral-800 text-center focus:ring-1 focus:ring-emerald-400 outline-none"
                            placeholder="0"
                          />
                          <span className="text-[11px] font-bold text-neutral-400">ถึง</span>
                          <input
                            type="number"
                            min="0"
                            value={tier.maxKm}
                            onChange={(e) =>
                              handleUpdateTier(idx, "maxKm", parseFloat(e.target.value) || 0)
                            }
                            className="w-16 sm:w-20 bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-neutral-800 text-center focus:ring-1 focus:ring-emerald-400 outline-none"
                            placeholder="30"
                          />
                          <span className="text-[11px] font-semibold text-neutral-600 shrink-0">กม.</span>
                        </div>
                      </div>

                      {/* Price Input & Badge */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-neutral-500 font-semibold shrink-0">ค่าส่ง:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={tier.price}
                            onChange={(e) =>
                              handleUpdateTier(idx, "price", parseFloat(e.target.value) || 0)
                            }
                            className={`w-24 sm:w-28 bg-white border ${
                              isFree ? "border-emerald-300 text-emerald-800 font-bold" : "border-neutral-300 text-neutral-800 font-bold"
                            } rounded-lg px-2 py-1 text-xs font-mono text-right focus:ring-1 focus:ring-emerald-400 outline-none`}
                            placeholder="0 = ฟรี"
                          />
                          <span className="text-[11px] font-semibold text-neutral-600 shrink-0">บาท</span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                            isFree
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {isFree ? "🟢 ส่งฟรี" : `฿${fmt(tier.price)}`}
                        </span>

                        {/* Delete Tier Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTier(idx)}
                          disabled={distanceTiers.length <= 1}
                          className="p-1 text-neutral-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-neutral-400 rounded-md transition"
                          title="ลบช่วงนี้"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Excess & Min Order Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-neutral-100">
                <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/80">
                  <label className="text-[11px] font-bold text-amber-900 block mb-1">
                    หากระยะทางเกินช่วงสูงสุด คิดเพิ่ม (บาท/กม.)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={excessRatePerKm}
                      onChange={(e) => {
                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                        handleInstantDeliveryTierUpdate(distanceTiers, val, minOrderFreeAmount, pricingMode);
                      }}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold font-mono text-amber-900 focus:ring-1 focus:ring-amber-400 outline-none"
                    />
                    <span className="text-xs font-bold text-amber-800 shrink-0">บ./กม.</span>
                  </div>
                  <span className="text-[9px] text-amber-700 mt-0.5 block">
                    เช่น เกินช่วงสูงสุด คิดราคาช่วงสูงสุด + กม.ละ {excessRatePerKm} บ.
                  </span>
                </div>

                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    ยอดสั่งซื้อขั้นต่ำที่ส่งฟรี (บาท)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={minOrderFreeAmount}
                      onChange={(e) => {
                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                        handleInstantDeliveryTierUpdate(distanceTiers, excessRatePerKm, val, pricingMode);
                      }}
                      placeholder="0 = ไม่จำกัดยอด"
                      className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-xs font-mono text-neutral-800 focus:ring-1 focus:ring-neutral-400 outline-none"
                    />
                    <span className="text-xs text-neutral-600 shrink-0">บาท</span>
                  </div>
                  <span className="text-[9px] text-neutral-500 mt-0.5 block">
                    เมื่อยอดถึงเกณฑ์ จะได้สิทธิ์ส่งฟรีทันที
                  </span>
                </div>
              </div>
            </div>

            {/* Live Summary Box */}
            <div className="bg-neutral-100/80 p-2.5 rounded-lg text-[11px] text-neutral-700 space-y-1 border border-neutral-200/80 mt-2">
              <div className="flex items-center justify-between font-bold text-neutral-800 pb-1 border-b border-neutral-200/60">
                <span>💡 ตัวอย่างสรุปอัตราค่าส่งปัจจุบัน:</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                  {distanceTiers.length} ช่วงระยะทาง
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                {[...distanceTiers]
                  .sort((a, b) => a.minKm - b.minKm)
                  .map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1">
                      <span className="text-neutral-500">•</span>
                      <span>{t.minKm}–{t.maxKm} กม. :</span>
                      <span className="font-bold text-neutral-900">
                        {t.price === 0 ? "ฟรี ฿0" : `฿${fmt(t.price)}`}
                      </span>
                    </span>
                  ))}
                {distanceTiers.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-800">
                    <span>•</span>
                    <span>เกิน {[...distanceTiers].sort((a, b) => a.minKm - b.minKm).slice(-1)[0]?.maxKm || 0} กม. :</span>
                    <span className="font-semibold">
                      +{excessRatePerKm} บ./กม.
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* 2.2 MINIMUM DELIVERY REQUIREMENT & 96% FULL TRUCKLOAD CRITERIA */}
            <div className="mt-4 pt-4 border-t border-neutral-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>เกณฑ์ยอดสั่งซื้อขั้นต่ำที่จัดส่ง (Minimum Delivery Requirement)</span>
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    กำหนดเงื่อนไขการรับออเดอร์จัดส่งของซัพพลายเออร์นี้ เช่น เต็มเที่ยวขนส่ง (≥96%), ตามน้ำหนัก หรือตามยอดเงิน
                  </p>
                </div>
              </div>

              {/* Criteria Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* 1. Full Truckload 96% */}
                <button
                  type="button"
                  onClick={() => handleInstantDeliveryConfigUpdate(
                    distanceTiers, excessRatePerKm, minOrderFreeAmount, pricingMode,
                    availableTrucks, "full_truckload_96", fullLoadThresholdPercent, minWeightKg
                  )}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    minOrderCriteria === "full_truckload_96"
                      ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                      : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-800">
                      <Truck size={14} className={minOrderCriteria === "full_truckload_96" ? "text-emerald-700" : "text-neutral-500"} />
                      <span>เต็มเที่ยวขนส่ง (Full Load)</span>
                    </div>
                    {minOrderCriteria === "full_truckload_96" && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                        เลือกอยู่
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-tight">
                    ต้องได้น้ำหนักอย่างน้อย <strong className="text-emerald-800 font-bold">{fullLoadThresholdPercent}%</strong> ของพิกัดรถแต่ละประเภท
                  </p>
                </button>

                {/* 2. Minimum Weight */}
                <button
                  type="button"
                  onClick={() => handleInstantDeliveryConfigUpdate(
                    distanceTiers, excessRatePerKm, minOrderFreeAmount, pricingMode,
                    availableTrucks, "min_weight", fullLoadThresholdPercent, minWeightKg || 12000
                  )}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    minOrderCriteria === "min_weight"
                      ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                      : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-800">
                      <Scale size={14} className={minOrderCriteria === "min_weight" ? "text-emerald-700" : "text-neutral-500"} />
                      <span>น้ำหนักรวมขั้นต่ำ</span>
                    </div>
                    {minOrderCriteria === "min_weight" && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                        เลือกอยู่
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-tight">
                    กำหนดน้ำหนักรวมตายตัว เช่น ขั้นต่ำ {fmt(minWeightKg || 12000)} กก.
                  </p>
                </button>

                {/* 3. Minimum Amount */}
                <button
                  type="button"
                  onClick={() => handleInstantDeliveryConfigUpdate(
                    distanceTiers, excessRatePerKm, minOrderFreeAmount, pricingMode,
                    availableTrucks, "min_amount", fullLoadThresholdPercent, minWeightKg
                  )}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    minOrderCriteria === "min_amount"
                      ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                      : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-800">
                      <DollarSign size={14} className={minOrderCriteria === "min_amount" ? "text-emerald-700" : "text-neutral-500"} />
                      <span>ยอดสั่งซื้อขั้นต่ำ</span>
                    </div>
                    {minOrderCriteria === "min_amount" && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                        เลือกอยู่
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-tight">
                    กำหนดยอดเงินสั่งซื้อรวม เช่น ฿{fmt(minOrderFreeAmount || 50000)} บาท
                  </p>
                </button>

                {/* 4. No Minimum / None */}
                <button
                  type="button"
                  onClick={() => handleInstantDeliveryConfigUpdate(
                    distanceTiers, excessRatePerKm, minOrderFreeAmount, pricingMode,
                    availableTrucks, "none", fullLoadThresholdPercent, minWeightKg
                  )}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    minOrderCriteria === "none"
                      ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                      : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-800">
                      <CheckCircle2 size={14} className={minOrderCriteria === "none" ? "text-emerald-700" : "text-neutral-500"} />
                      <span>ไม่จำกัดเกณฑ์ขั้นต่ำ</span>
                    </div>
                    {minOrderCriteria === "none" && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                        เลือกอยู่
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-tight">
                    จัดส่งทุกขนาดออเดอร์ตามตารางอัตราค่าส่งระยะทางปกติ
                  </p>
                </button>
              </div>

              {/* Threshold Detail Config Sub-bar */}
              {minOrderCriteria === "full_truckload_96" && (
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>🎯 เปอร์เซ็นต์เกณฑ์เต็มเที่ยวขนส่ง:</span>
                      <span className="bg-emerald-600 text-white font-mono font-bold px-2 py-0.5 rounded-md">
                        {fullLoadThresholdPercent}%
                      </span>
                    </span>
                    <p className="text-[10px] text-emerald-800">
                      ออเดอร์จะต้องมีน้ำหนักอย่างน้อย {fullLoadThresholdPercent}% ของพิกัดประเภทรถที่เลือก จึงจะถือว่าเต็มเที่ยวและคุ้มค่าจัดส่ง
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-emerald-900">ปรับเกณฑ์ %:</span>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={fullLoadThresholdPercent}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(1, parseFloat(e.target.value) || 96));
                        handleInstantDeliveryConfigUpdate(
                          distanceTiers, excessRatePerKm, minOrderFreeAmount, pricingMode,
                          availableTrucks, minOrderCriteria, val, minWeightKg
                        );
                      }}
                      className="w-16 bg-white border border-emerald-400 rounded-lg px-2 py-1 text-xs font-mono font-bold text-center text-emerald-950 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                    <span className="font-bold text-emerald-900">%</span>

                    {/* Quick percentage buttons */}
                    <div className="flex gap-1">
                      {[90, 95, 96, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleInstantDeliveryConfigUpdate(
                            distanceTiers, excessRatePerKm, minOrderFreeAmount, pricingMode,
                            availableTrucks, minOrderCriteria, pct, minWeightKg
                          )}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition ${
                            fullLoadThresholdPercent === pct
                              ? "bg-emerald-700 text-white"
                              : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {minOrderCriteria === "min_weight" && (
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-950">
                      ⚖️ น้ำหนักรวมขั้นต่ำที่เปิดรับจัดส่ง:
                    </span>
                    <p className="text-[10px] text-emerald-800">
                      ออเดอร์ที่น้ำหนักน้อยกว่านี้จะไม่เข้าเกณฑ์จัดส่งตรง
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={minWeightKg}
                      onChange={(e) => {
                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                        handleInstantDeliveryConfigUpdate(
                          distanceTiers, excessRatePerKm, minOrderFreeAmount, pricingMode,
                          availableTrucks, minOrderCriteria, fullLoadThresholdPercent, val
                        );
                      }}
                      className="w-28 bg-white border border-emerald-400 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-right text-emerald-950 focus:ring-1 focus:ring-emerald-500 outline-none"
                      placeholder="12000"
                    />
                    <span className="font-bold text-emerald-900">กก. ({((minWeightKg || 0) / 1000).toFixed(1)} ตัน)</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2.3 SUPPLIER TRUCK FLEET & WEIGHT CAPACITIES */}
            <div className="mt-4 pt-4 border-t border-neutral-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#C62828]" />
                    <span>กองรถขนส่ง & พิกัดน้ำหนักบรรทุกของ {supplierName}</span>
                    <span className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200">
                      เปิดใช้ {availableTrucks.filter(t => t.enabled).length}/{availableTrucks.length} คัน
                    </span>
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    ติ๊กเลือก [✓] ประเภทรถที่ซัพพลายเออร์นี้มีให้บริการ และระบุน้ำหนักบรรทุกปลอดภัย (กก./ตัน) เพื่อใช้คำนวณเกณฑ์เต็มเที่ยว
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleAddTruck}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition"
                  >
                    <Plus size={12} />
                    <span>เพิ่มประเภทรถ</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetTrucks}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-2.5 py-1 rounded-lg transition"
                    title="คืนค่ากองรถมาตรฐาน"
                  >
                    <RotateCcw size={12} />
                    <span>คืนค่ามาตรฐาน</span>
                  </button>
                </div>
              </div>

              {/* Truck Fleet Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {availableTrucks.map((truck, idx) => {
                  const target96 = Math.round(truck.capacityKg * (fullLoadThresholdPercent / 100));
                  return (
                    <div
                      key={truck.id || idx}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                        truck.enabled
                          ? "bg-white border-neutral-300 shadow-xs hover:border-neutral-400"
                          : "bg-neutral-50/80 border-neutral-200 opacity-60 hover:opacity-90"
                      }`}
                    >
                      {/* Top Row: Checkbox, Truck Name input, Delete button */}
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={truck.enabled}
                            onChange={() => handleToggleTruck(truck.id)}
                            className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className={`text-xs font-bold ${truck.enabled ? "text-neutral-900" : "text-neutral-500 line-through"}`}>
                            {truck.enabled ? "เปิดให้บริการ" : "ไม่รองรับ"}
                          </span>
                        </label>

                        {availableTrucks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTruck(truck.id)}
                            className="text-neutral-400 hover:text-red-600 p-1 rounded transition"
                            title="ลบรถประเภทนี้"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* Middle Row: Name and Capacity inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-7">
                          <input
                            type="text"
                            value={truck.name}
                            onChange={(e) => handleUpdateTruck(truck.id, "name", e.target.value)}
                            disabled={!truck.enabled}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-800 focus:bg-white focus:ring-1 focus:ring-neutral-400 outline-none disabled:bg-neutral-100 disabled:text-neutral-400"
                            placeholder="ชื่อประเภทรถ"
                          />
                        </div>

                        <div className="sm:col-span-5 flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={truck.capacityKg}
                            onChange={(e) => handleUpdateTruck(truck.id, "capacityKg", parseFloat(e.target.value) || 0)}
                            disabled={!truck.enabled}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-right text-neutral-800 focus:bg-white focus:ring-1 focus:ring-neutral-400 outline-none disabled:bg-neutral-100 disabled:text-neutral-400"
                            placeholder="7500"
                          />
                          <span className="text-[11px] font-semibold text-neutral-600 shrink-0">กก.</span>
                        </div>
                      </div>

                      {/* Bottom Row: 96% Full Load Target indicator */}
                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-neutral-150/70 text-neutral-500">
                        <span className="font-mono text-neutral-700 font-semibold">
                          พิกัด: {(truck.capacityKg / 1000).toFixed(1)} ตัน
                        </span>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                          🎯 เกณฑ์เต็มเที่ยว {fullLoadThresholdPercent}% = {fmt(target96)} กก. ({(target96 / 1000).toFixed(1)} ตัน)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. PRICES, COSTS, MARKUP & WEIGHTS SECTION FOR CURRENT SELECTED SUPPLIER */}
        <div className="pt-2">
          {/* Tab Switcher Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-neutral-200">
            <div className="flex items-center gap-2 p-1 bg-neutral-100/90 rounded-2xl border border-neutral-200/90 self-start">
              <button
                type="button"
                onClick={() => setActivePriceWeightTab("prices")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  activePriceWeightTab === "prices"
                    ? "bg-[#C62828] text-white shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
                }`}
              >
                <DollarSign size={15} />
                <span>💰 ราคาขาย, ต้นทุน & บวกกำไร</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePriceWeightTab("weights")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  activePriceWeightTab === "weights"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
                }`}
              >
                <Scale size={15} />
                <span>⚖️ พิกัดน้ำหนักบรรทุก (กก.)</span>
              </button>
            </div>

            <div className="text-xs text-neutral-500 font-medium">
              กำลังตั้งค่าสำหรับ: <span className="font-bold text-neutral-800">{supplierName}</span> {supplierCode ? `(${supplierCode})` : ""}
            </div>
          </div>

          {/* Pricing, Cost & Markup Tab */}
          {activePriceWeightTab === "prices" && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs">
              <SupplierPricingSection
                pricesInput={pricesInput}
                costsInput={costsInput}
                onPriceChange={handlePriceChange}
                onCostChange={handleCostChange}
                onMarkupChange={handleMarkupChange}
                onApplyBulkMarkup={handleApplyBulkMarkup}
              />
            </div>
          )}

          {/* Weights Tab */}
          {activePriceWeightTab === "weights" && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs">
              <SupplierWeightsSection
                weightsInput={weightsInput}
                onWeightChange={handleWeightChange}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={handleDownloadSingleHTML}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-3 px-5 rounded-xl shadow-md text-xs sm:text-sm transition"
          >
            <Download size={16} />
            <span>ดาวน์โหลด HTML ออฟไลน์</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveCurrentSupplier(false)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold py-3 px-6 rounded-xl shadow-md text-xs sm:text-sm transition"
          >
            <Save size={16} />
            <span>บันทึกการตั้งค่าของ {supplierName}</span>
          </button>
        </div>
      </div>

      {/* 4. MODAL: ADD NEW SUPPLIER */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative z-10 space-y-5 border border-neutral-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-50 text-[#C62828] rounded-xl">
                    <Factory size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-neutral-800 text-lg font-display">
                      เพิ่มซัพพลายเออร์ / โรงงานใหม่
                    </h4>
                    <p className="text-neutral-500 text-xs">กำหนดชื่อและอัตราเริ่มต้นสำหรับซัพพลายเออร์นี้</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateSupplier} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    ชื่อซัพพลายเออร์ / โรงงานผู้ผลิต <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newSupName}
                    onChange={(e) => setNewSupName(e.target.value)}
                    placeholder="เช่น โรงงานคอนกรีตระยอง, ซัพพลายเออร์ B"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-neutral-800 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-[#C62828] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">รหัสย่อ (Code)</label>
                    <input
                      type="text"
                      value={newSupCode}
                      onChange={(e) => setNewSupCode(e.target.value)}
                      placeholder="เช่น SP-03, RY-01"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-sm font-mono text-neutral-800 focus:bg-white focus:border-[#C62828] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">คัดลอกราคาตั้งต้นจาก</label>
                    <select
                      value={newSupBaseTemplate}
                      onChange={(e) => setNewSupBaseTemplate(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-800 focus:bg-white focus:border-[#C62828] outline-none"
                    >
                      {currentSuppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">โน้ต / คำอธิบายสเปก</label>
                  <textarea
                    rows={2}
                    value={newSupDesc}
                    onChange={(e) => setNewSupDesc(e.target.value)}
                    placeholder="เช่น โรงงานซัพพลายเออร์ส่งงานแถบชลบุรี-ระยอง"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-800 focus:bg-white focus:border-[#C62828] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-bold transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                  >
                    <Plus size={15} />
                    <span>สร้างซัพพลายเออร์</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. HIDDEN DOCUMENT FOR JPG REPORT GENERATION */}
      <div className="absolute" style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "840px", height: "auto", overflow: "visible" }}>
        <div
          ref={reportRef}
          className="w-[820px] p-10 bg-white font-sans text-neutral-800 relative space-y-8"
          style={{ fontFamily: "'Kanit', sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-4 border-[#C62828] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase bg-red-100 text-[#C62828] px-2 py-0.5 rounded">
                  {supplierCode || "SUPPLIER"}
                </span>
                <h1 className="text-2xl font-black text-[#C62828] tracking-tight uppercase">
                  {supplierName}
                </h1>
              </div>
              <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider block mt-1">
                Concrete and Prestressed Slab Material Catalog ({APP_VERSION})
              </span>
              {supplierDesc && (
                <p className="text-xs text-neutral-500 font-medium mt-0.5">{supplierDesc}</p>
              )}
            </div>
            <div className="text-right">
              <span className="bg-[#C62828]/10 text-[#C62828] font-bold text-xs py-1 px-3 rounded-full">
                แค็ตตาล็อกอัตราราคากลาง
              </span>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                วันที่พิมพ์เอกสาร: {new Date().toLocaleDateString("th-TH")}
              </p>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="space-y-6">
            <h2 className="text-base font-bold text-[#8B0000] border-b border-neutral-200 pb-1">
              ตารางกำหนดราคาส่งมอบมาตรฐาน (ภาษีมูลค่าเพิ่มกำหนดอัตรา {pricesInput.vatPercent}%)
            </h2>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-neutral-500 font-medium">แผ่นพื้นสำเร็จรูปธรรมดา (กว้าง 0.35ม.):</span>
                  <strong className="text-neutral-900 font-bold">฿{fmt(pricesInput.normalBoardPrice)} / ตร.ม.</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-neutral-500 font-medium">แผ่นพื้นสำเร็จรูป มอก.:</span>
                  <strong className="text-neutral-900 font-bold">฿{fmt(pricesInput.mocBoardPrice)} / ตร.ม.</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-neutral-500 font-medium">แผ่นพื้นกลวง (Hollow Core Standard):</span>
                  <strong className="text-neutral-900 font-bold">฿{fmt(pricesInput.hcPriceSqm)} / ตร.ม.</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-neutral-500 font-medium">เสาเข็มหน้าไอ I-15:</span>
                  <strong className="text-neutral-900 font-bold">฿{fmt(pricesInput.i15Price)} / เมตร</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-neutral-500 font-medium">เสาเข็มหกเหลี่ยมกลวง (Hex):</span>
                  <strong className="text-neutral-900 font-bold">฿{fmt(pricesInput.hexPilePrice)} / เมตร</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-neutral-500 font-medium">เสารั้วหน้า 3 นิ้ว:</span>
                  <strong className="text-neutral-900 font-bold">฿{fmt(pricesInput.fence3Price)} / เมตร</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-neutral-500 font-medium">เสารั้วหน้า 4 นิ้ว:</span>
                  <strong className="text-neutral-900 font-bold">฿{fmt(pricesInput.fence4Price)} / เมตร</strong>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-neutral-500 font-medium text-xs">ไอ I-18 ธรรมดา (ท่อนเดียว):</span>
                  <strong className="text-neutral-900 font-semibold font-mono">฿{fmt(pricesInput.i18NoTISPrice)} / ม.</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-[#8B0000] font-semibold text-xs">ไอ I-18 มอก. (ท่อนเดียว):</span>
                  <strong className="text-[#8B0000] font-bold font-mono">฿{fmt(pricesInput.i18TISPrice)} / ม.</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-neutral-500 font-medium text-xs">ไอ I-18 ธรรมดา (ท่อนต่อ):</span>
                  <strong className="text-neutral-900 font-semibold font-mono">฿{fmt(pricesInput.i18JointPrice)} / ม.</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-[#8B0000] font-semibold text-xs">ไอ I-18 มอก. (ท่อนต่อ):</span>
                  <strong className="text-[#8B0000] font-bold font-mono">฿{fmt(pricesInput.i18TISJointPrice)} / ม.</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5 pt-1.5">
                  <span className="text-neutral-500 font-medium text-xs">ไอ I-22 ธรรมดา (ท่อนเดียว):</span>
                  <strong className="text-neutral-900 font-semibold font-mono">฿{fmt(pricesInput.i22NoTISPrice)} / ม.</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                  <span className="text-[#8B0000] font-semibold text-xs">ไอ I-22 มอก. (ท่อนเดียว):</span>
                  <strong className="text-[#8B0000] font-bold font-mono">฿{fmt(pricesInput.i22TISPrice)} / ม.</strong>
                </div>
              </div>
            </div>

            {/* S-Piles Table */}
            <div className="border-t border-neutral-100 pt-4 space-y-2">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">
                กลุ่มเสาสี่เหลี่ยมตัน S-Shape (Solid Square Pile)
              </h3>
              <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1">
                  <span className="text-neutral-500 font-medium">เสาตัน S-18:</span>
                  <strong className="text-neutral-900 font-semibold font-mono">฿{fmt(pricesInput.s18Price)} / ม.</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1">
                  <span className="text-neutral-500 font-medium">เสาตัน S-22:</span>
                  <strong className="text-neutral-900 font-semibold font-mono">฿{fmt(pricesInput.s22Price)} / ม.</strong>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1">
                  <span className="text-neutral-500 font-medium">เสาตัน S-26:</span>
                  <strong className="text-neutral-900 font-semibold font-mono">฿{fmt(pricesInput.s26Price)} / ม.</strong>
                </div>
              </div>
            </div>

            <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50 text-xs">
              <span className="font-bold block text-neutral-800 mb-1">ข้อพิจารณาและการใช้งาน</span>
              <p className="text-neutral-500 leading-relaxed">
                ราคาระบุข้างต้นเป็นราคาอ้างอิงส่งมอบมาตรฐานของ {supplierName} ค่าพาหนะขนส่งขึ้นอยู่กับระยะทางการจัดส่งหน้างานและพิกัดน้ำหนักรวม
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-100 pt-6">
            <span>เอกสารสารประโยชน์ราคากลาง ออกโดยระบบอัตโนมัติ</span>
            <span>{APP_VERSION}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
