import { SupplierProfile, DistanceTier } from "../types";

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface DeliveryCalculationResult {
  supplierId: string;
  supplierName: string;
  origin: GeoLocation;
  destination: GeoLocation;
  distanceKm: number;
  isFreeDelivery: boolean;
  freeRadiusKm: number;
  excessDistanceKm: number;
  ratePerKm: number;
  basePrice: number;
  deliveryFee: number;
  matchedTier?: DistanceTier;
  distanceTiers?: DistanceTier[];
  directionsUrl: string;
  reason: string;
}

// Extensive Preset Popular Construction, Industrial Estates & Hub Locations in Thailand for Instant Resolution
export const PRESET_LOCATIONS: { name: string; address: string; lat: number; lng: number; province: string; keywords: string[] }[] = [
  { 
    name: "พงษ์สกุลฮาร์ดแวร์ (มหาชัย/สมุทรสาคร)", 
    address: "ต.ท่าทราย อ.เมือง จ.สมุทรสาคร", 
    lat: 13.5475, 
    lng: 100.2745, 
    province: "สมุทรสาคร",
    keywords: ["พงษ์สกุล", "มหาชัย", "ท่าทราย", "สมุทรสาคร", "เมืองสมุทรสาคร"]
  },
  { 
    name: "โซนพระราม 2 / แสมดำ", 
    address: "ถ.พระราม 2 แสมดำ บางขุนเทียน กทม.", 
    lat: 13.6265, 
    lng: 100.3956, 
    province: "กรุงเทพฯ",
    keywords: ["พระราม 2", "พระราม2", "แสมดำ", "บางขุนเทียน", "สะแกงาม", "พันท้ายนรสิงห์"]
  },
  { 
    name: "โซนบางขุนเทียน / ท่าข้าม / ประชาอุทิศ", 
    address: "ท่าข้าม บางขุนเทียน กทม.", 
    lat: 13.6385, 
    lng: 100.4421, 
    province: "กรุงเทพฯ",
    keywords: ["ท่าข้าม", "หัวกระบือ", "ประชาอุทิศ", "ทุ่งครุ", "ราษฎร์บูรณะ"]
  },
  { 
    name: "โซนบางบอน / เอกชัย", 
    address: "ถ.เอกชัย แขวงบางบอน เขตบางบอน กทม.", 
    lat: 13.6621, 
    lng: 100.3842, 
    province: "กรุงเทพฯ",
    keywords: ["บางบอน", "เอกชัย", "บางแค", "เพชรเกษม", "หนองแขม"]
  },
  { 
    name: "โซนกระทุ่มแบน / อ้อมน้อย", 
    address: "อ.กระทุ่มแบน จ.สมุทรสาคร", 
    lat: 13.6558, 
    lng: 100.2978, 
    province: "สมุทรสาคร",
    keywords: ["กระทุ่มแบน", "อ้อมน้อย", "สวนหลวง", "แคราย", "บ้านแพ้ว"]
  },
  { 
    name: "โซนพุทธมณฑล สาย 4 - 5 / สามพราน", 
    address: "ถ.พุทธมณฑลสาย 4 อ.สามพราน จ.นครปฐม", 
    lat: 13.7386, 
    lng: 100.3214, 
    province: "นครปฐม",
    keywords: ["พุทธมณฑล", "สาย 4", "สาย 5", "สาย 3", "สาย 2", "สามพราน", "ศาลายา", "อ้อมใหญ่"]
  },
  { 
    name: "โซนเมืองนครปฐม / นครชัยศรี", 
    address: "อ.เมืองนครปฐม จ.นครปฐม", 
    lat: 13.8196, 
    lng: 100.0601, 
    province: "นครปฐม",
    keywords: ["นครปฐม", "นครชัยศรี", "ดอนตูม", "กำแพงแสน"]
  },
  { 
    name: "โซนบางใหญ่ / บางบัวทอง / นนทบุรี", 
    address: "อ.บางบัวทอง จ.นนทบุรี", 
    lat: 13.9142, 
    lng: 100.4185, 
    province: "นนทบุรี",
    keywords: ["บางใหญ่", "บางบัวทอง", "ไทรน้อย", "ปากเกร็ด", "นนทบุรี", "รัตนาธิเบศร์", "ราชพฤกษ์", "กาญจนาภิเษก"]
  },
  { 
    name: "โซนพระประแดง / พระสมุทรเจดีย์", 
    address: "อ.พระประแดง จ.สมุทรปราการ", 
    lat: 13.6582, 
    lng: 100.5342, 
    province: "สมุทรปราการ",
    keywords: ["พระประแดง", "พระสมุทรเจดีย์", "สุขสวัสดิ์", "ปู่เจ้าสมิงพราย"]
  },
  { 
    name: "โซนบางนา-ตราด กม.10 / บางพลี", 
    address: "ถ.บางนา-ตราด ต.บางพลีใหญ่ จ.สมุทรปราการ", 
    lat: 13.6324, 
    lng: 100.6892, 
    province: "สมุทรปราการ",
    keywords: ["บางนา", "บางพลี", "กิ่งแก้ว", "เทพารักษ์", "บางปู", "บางบ่อ", "บางเสาธง", "สมุทรปราการ"]
  },
  { 
    name: "โซนลาดกระบัง / มีนบุรี / สุวรรณภูมิ", 
    address: "เขตลาดกระบัง กทม.", 
    lat: 13.7235, 
    lng: 100.7852, 
    province: "กรุงเทพฯ",
    keywords: ["ลาดกระบัง", "มีนบุรี", "ร่มเกล้า", "สุวรรณภูมิ", "ประเวศ", "คลองสามวา", "หนองจอก"]
  },
  { 
    name: "โซนรังสิต / คลองหลวง / ปทุมธานี", 
    address: "ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี", 
    lat: 14.0215, 
    lng: 100.6145, 
    province: "ปทุมธานี",
    keywords: ["รังสิต", "ปทุมธานี", "คลองหลวง", "นวนคร", "ธัญบุรี", "ลำลูกกา", "สามโคก", "เมืองปทุมธานี"]
  },
  { 
    name: "โซนวังน้อย / พระนครศรีอยุธยา", 
    address: "อ.วังน้อย จ.พระนครศรีอยุธยา", 
    lat: 14.2341, 
    lng: 100.7125, 
    province: "อยุธยา",
    keywords: ["วังน้อย", "อยุธยา", "พระนครศรีอยุธยา", "บางปะอิน", "โรจนะ", "อุทัย", "เสนา"]
  },
  { 
    name: "โซนนิคมอมตะซิตี้ / เมืองชลบุรี", 
    address: "อ.เมืองชลบุรี จ.ชลบุรี", 
    lat: 13.3611, 
    lng: 100.9847, 
    province: "ชลบุรี",
    keywords: ["ชลบุรี", "อมตะ", "อมตะนคร", "พานทอง", "บ้านบึง", "เมืองชลบุรี"]
  },
  { 
    name: "โซนศรีราชา / แหลมฉบัง / พัทยา", 
    address: "อ.ศรีราชา จ.ชลบุรี", 
    lat: 13.1678, 
    lng: 100.9315, 
    province: "ชลบุรี",
    keywords: ["ศรีราชา", "แหลมฉบัง", "พัทยา", "บางละมุง", "สัตหีบ", "บ่อวิน"]
  },
  { 
    name: "โซนนิคมพัฒนา / ปลวกแดง / ระยอง", 
    address: "อ.ปลวกแดง จ.ระยอง", 
    lat: 12.9812, 
    lng: 101.2154, 
    province: "ระยอง",
    keywords: ["ระยอง", "ปลวกแดง", "นิคมพัฒนา", "มาบตาพุด", "เมืองระยอง", "บ้านฉาง"]
  },
  { 
    name: "โซนบ้านโป่ง / เมืองราชบุรี", 
    address: "อ.บ้านโป่ง จ.ราชบุรี", 
    lat: 13.8115, 
    lng: 99.8778, 
    province: "ราชบุรี",
    keywords: ["บ้านโป่ง", "ราชบุรี", "โพธาราม", "เมืองราชบุรี", "ดำเนินสะดวก"]
  },
  { 
    name: "โซนเมืองเพชรบุรี / ชะอำ / หัวหิน", 
    address: "อ.เมืองเพชรบุรี จ.เพชรบุรี", 
    lat: 13.1112, 
    lng: 99.9392, 
    province: "เพชรบุรี",
    keywords: ["เพชรบุรี", "เขาย้อย", "ท่ายาง", "ชะอำ", "หัวหิน", "ปราณบุรี"]
  },
  { 
    name: "โซนแปลงยาว / บางปะกง / ฉะเชิงเทรา", 
    address: "อ.บางปะกง จ.ฉะเชิงเทรา", 
    lat: 13.5412, 
    lng: 100.9985, 
    province: "ฉะเชิงเทรา",
    keywords: ["ฉะเชิงเทรา", "แปดริ้ว", "บางปะกง", "แปลงยาว", "พนมสารคาม", "เวลโกรว์"]
  },
  { 
    name: "โซนหนองแค / แก่งคอย / สระบุรี", 
    address: "อ.หนองแค จ.สระบุรี", 
    lat: 14.3412, 
    lng: 100.8654, 
    province: "สระบุรี",
    keywords: ["สระบุรี", "หนองแค", "แก่งคอย", "เมืองสระบุรี", "วิหารแดง"]
  }
];

/**
 * Parse a Google Maps URL, raw latitude/longitude, or text string to extract coordinates.
 * Supports:
 * - Any string containing coordinates like `13.5475, 100.2745` or `13.5475 100.2745`
 * - https://maps.app.goo.gl/... (returns original text or hint)
 * - https://www.google.com/maps?q=13.5475,100.2745
 * - https://www.google.com/maps/place/.../@13.5475,100.2745,15z
 * - https://www.google.com/maps/search/13.5475,100.2745
 * - https://maps.google.com/?daddr=13.5475,100.2745
 * - Thai province/district keyword matching (e.g. "ชลบุรี", "รังสิต", "มหาชัย", "พระราม 2")
 */
export function parseGoogleMapsInput(input: string): { lat?: number; lng?: number; address?: string; isUrl: boolean; matchedName?: string } {
  if (!input || !input.trim()) {
    return { isUrl: false };
  }

  const trimmed = input.trim();
  const isUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.includes("maps.google") || trimmed.includes("goo.gl");

  // 1. Direct Regex for "@latitude,longitude" in Google Maps URLs (e.g. /@13.5475,100.2745,15z)
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { lat, lng, isUrl: true };
    }
  }

  // 2. Regex for "q=lat,lng" or "ll=lat,lng" or "query=lat,lng" or "daddr=lat,lng"
  const qMatch = trimmed.match(/[?&](?:q|ll|query|destination|daddr)=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { lat, lng, isUrl: true };
    }
  }

  // 3. Regex for "/place/.../data=...!3dlat!4dlng" in new Google Maps URLs
  const dataMatch = trimmed.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) {
    const lat = parseFloat(dataMatch[1]);
    const lng = parseFloat(dataMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { lat, lng, isUrl: true };
    }
  }

  // 4. Raw coordinate anywhere in text string (e.g., "13.5475, 100.2745" or embedded in sentence)
  const coordMatch = trimmed.match(/(-?\d{1,2}\.\d+)[,\s]+(-?\d{2,3}\.\d+)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (isValidLatLng(lat, lng)) {
      return { lat, lng, isUrl: isUrl };
    }
  }

  // 5. Match with Thai preset locations by keyword / district / province
  const lower = trimmed.toLowerCase();
  for (const p of PRESET_LOCATIONS) {
    const isMatched = 
      lower.includes(p.name.toLowerCase()) || 
      lower.includes(p.province.toLowerCase()) || 
      lower.includes(p.address.toLowerCase()) ||
      p.keywords.some(kw => lower.includes(kw.toLowerCase()));
    
    if (isMatched) {
      return { 
        lat: p.lat, 
        lng: p.lng, 
        address: p.address, 
        matchedName: p.name,
        isUrl: false 
      };
    }
  }

  return { isUrl, address: isUrl ? undefined : trimmed };
}

/**
 * Validates whether latitude and longitude are within standard geographical bounds
 */
export function isValidLatLng(lat?: number, lng?: number): boolean {
  if (lat === undefined || lng === undefined) return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat !== 0 || lng !== 0);
}

/**
 * Calculate Great-Circle Distance via Haversine Formula (in Kilometers)
 * Applies a 1.25x road factor (winding factor) to closely reflect actual driving distance on Thai road networks.
 */
export function calculateRoadDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  roadFactor: number = 1.25
): number {
  if (!isValidLatLng(lat1, lon1) || !isValidLatLng(lat2, lon2)) {
    return 0;
  }

  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineDistance = R * c;

  // Road distance with winding adjustment
  const roadDistance = straightLineDistance * roadFactor;
  return Math.round(roadDistance * 10) / 10; // 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Create a Google Maps Directions URL (Driving Mode) for direct 1-click navigation and route preview.
 */
export function createGoogleMapsDirectionsUrl(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  originName?: string,
  destName?: string
): string {
  const origin = `${originLat},${originLng}`;
  const destination = `${destLat},${destLng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
}

/**
 * Calculate delivery cost and distance policy for a specific supplier profile
 */
export function calculateSupplierDelivery(
  supplier: SupplierProfile,
  destLat?: number,
  destLng?: number,
  destAddress?: string,
  destName?: string,
  orderTotalAmount?: number
): DeliveryCalculationResult | null {
  // Origin coordinates from supplier profile
  const originLat = supplier.supplierLocation?.lat || 13.5475;
  const originLng = supplier.supplierLocation?.lng || 100.2745;
  const originAddress = supplier.supplierLocation?.address || supplier.location || supplier.name;

  if (!isValidLatLng(destLat, destLng)) {
    return null;
  }

  // Calculate driving distance
  const distanceKm = calculateRoadDistanceKm(originLat, originLng, destLat!, destLng!);

  // Delivery configuration of this specific supplier
  const deliveryConfig = supplier.deliveryConfig || {
    pricingMode: "tiered",
    distanceTiers: [
      { id: "tier-1", minKm: 0, maxKm: 30, price: 0 },
      { id: "tier-2", minKm: 31, maxKm: 60, price: 3000 },
      { id: "tier-3", minKm: 61, maxKm: 90, price: 4500 },
      { id: "tier-4", minKm: 91, maxKm: 120, price: 6000 },
    ],
    excessRatePerKm: 35,
    freeRadiusKm: 30,
    ratePerKm: 25,
    basePrice: 0,
    minOrderFreeAmount: 0,
  };

  const minOrderFree = deliveryConfig.minOrderFreeAmount ?? 0;
  const isOrderAmountFree = minOrderFree > 0 && orderTotalAmount !== undefined && orderTotalAmount >= minOrderFree;

  // Use tiered pricing if distanceTiers is available and not disabled
  const hasTiers = deliveryConfig.distanceTiers && deliveryConfig.distanceTiers.length > 0;
  const isTieredMode = deliveryConfig.pricingMode !== "per_km" && hasTiers;

  let deliveryFee = 0;
  let isFreeDelivery = false;
  let excessDistanceKm = 0;
  let freeRadius = deliveryConfig.freeRadiusKm ?? 30;
  let ratePerKm = deliveryConfig.ratePerKm ?? 25;
  let basePrice = deliveryConfig.basePrice ?? 0;
  let matchedTier: DistanceTier | undefined = undefined;
  let reason = "";

  if (isOrderAmountFree) {
    isFreeDelivery = true;
    deliveryFee = 0;
    reason = `ยอดสั่งซื้อครบ ฿${minOrderFree.toLocaleString()} (ได้รับสิทธิ์ส่งฟรีตามเงื่อนไขยอดสั่งซื้อขั้นต่ำ)`;
  } else if (isTieredMode) {
    const rawTiers = deliveryConfig.distanceTiers || [];
    const sortedTiers = [...rawTiers].sort((a, b) => a.minKm - b.minKm);
    const highestTier = sortedTiers[sortedTiers.length - 1];
    const firstTier = sortedTiers[0];
    const excessRate = deliveryConfig.excessRatePerKm ?? 35;

    // Detect free radius from tiers
    const freeTier = sortedTiers.find((t) => t.price === 0);
    if (freeTier) {
      freeRadius = freeTier.maxKm;
    }

    // Check if distance matches any tier
    const foundTier = sortedTiers.find(
      (t) => distanceKm >= t.minKm && distanceKm <= t.maxKm
    );

    if (foundTier) {
      matchedTier = foundTier;
      deliveryFee = foundTier.price;
      isFreeDelivery = foundTier.price === 0;
      if (isFreeDelivery) {
        reason = `ระยะทาง ${distanceKm} กม. อยู่ในช่วง ${foundTier.minKm}–${foundTier.maxKm} กม. (ส่งฟรี ฿0)`;
      } else {
        reason = `ระยะทาง ${distanceKm} กม. อยู่ในช่วง ${foundTier.minKm}–${foundTier.maxKm} กม. (คิดค่าส่ง ฿${foundTier.price.toLocaleString()})`;
      }
    } else if (distanceKm < firstTier.minKm) {
      // Under lowest tier
      matchedTier = firstTier;
      deliveryFee = firstTier.price;
      isFreeDelivery = firstTier.price === 0;
      reason = `ระยะทาง ${distanceKm} กม. อยู่ในเกณฑ์ช่วงแรก 0–${firstTier.maxKm} กม. (${isFreeDelivery ? "ส่งฟรี ฿0" : `ค่าส่ง ฿${firstTier.price.toLocaleString()}`})`;
    } else if (distanceKm > highestTier.maxKm) {
      // Over highest tier
      excessDistanceKm = Math.max(0, Math.round((distanceKm - highestTier.maxKm) * 10) / 10);
      deliveryFee = highestTier.price + Math.round(excessDistanceKm * excessRate);
      isFreeDelivery = false;
      reason = `เกินช่วงระยะทางสูงสุด (${highestTier.maxKm} กม.) เป็นระยะ ${excessDistanceKm} กม. (คิดอัตราช่วง ฿${highestTier.price.toLocaleString()} + ส่วนเกิน ${excessRate} บ./กม.)`;
    }
  } else {
    // Standard per_km mode
    const isDistanceFree = distanceKm <= freeRadius;
    isFreeDelivery = isDistanceFree;

    if (isDistanceFree) {
      reason = `อยู่ในระยะส่งฟรี (ระยะทาง ${distanceKm} กม. ≤ สิทธิ์ส่งฟรี ${freeRadius} กม.)`;
    } else {
      excessDistanceKm = Math.max(0, Math.round((distanceKm - freeRadius) * 10) / 10);
      deliveryFee = basePrice + Math.round(excessDistanceKm * ratePerKm);
      reason = `เกินระยะส่งฟรี ${excessDistanceKm} กม. (คิดอัตราส่วนเกิน ${ratePerKm} บาท/กม.${basePrice > 0 ? ` + ค่าเริ่ม ฿${basePrice}` : ""})`;
    }
  }

  const directionsUrl = createGoogleMapsDirectionsUrl(
    originLat,
    originLng,
    destLat!,
    destLng!,
    supplier.name,
    destName || destAddress
  );

  return {
    supplierId: supplier.id,
    supplierName: supplier.name,
    origin: {
      lat: originLat,
      lng: originLng,
      address: originAddress,
      name: supplier.name,
    },
    destination: {
      lat: destLat!,
      lng: destLng!,
      address: destAddress || `${destLat!.toFixed(4)}, ${destLng!.toFixed(4)}`,
      name: destName,
    },
    distanceKm,
    isFreeDelivery,
    freeRadiusKm: freeRadius,
    excessDistanceKm,
    ratePerKm,
    basePrice,
    deliveryFee,
    matchedTier,
    distanceTiers: deliveryConfig.distanceTiers,
    directionsUrl,
    reason,
  };
}
