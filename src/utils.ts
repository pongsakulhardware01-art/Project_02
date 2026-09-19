import { loadCapacityTable } from "./data";

export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return "0.00";
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function roundToBeautifulPrice(num: number): number {
  if (num <= 0) return 0;
  return Math.ceil(num / 5) * 5;
}

export function getLoadCapacity(length: number, wireCount: string): number {
  const lengthKeys = Object.keys(loadCapacityTable).map(Number).sort((a, b) => a - b);
  const wireIndexMap: Record<string, number> = { "4": 0, "5": 1, "6": 2, "7": 3, "8": 4 };

  let effectiveWireCount = wireCount;
  let index = wireIndexMap[effectiveWireCount] !== undefined
    ? wireIndexMap[effectiveWireCount]
    : (parseInt(effectiveWireCount) > 8 || effectiveWireCount === "5_mm_5" ? 4 : 0);

  if (index > 4) index = 4;

  let closestLengthKey = lengthKeys.find((key) => key >= length);

  if (!closestLengthKey) {
    closestLengthKey = lengthKeys[lengthKeys.length - 1];
  } else if (length < lengthKeys[0]) {
    closestLengthKey = lengthKeys[0];
  }

  const capacityArray = loadCapacityTable[closestLengthKey];

  if (capacityArray && capacityArray[index] !== undefined) {
    return capacityArray[index];
  }

  return 0;
}

export function compressImage(
  fileOrBase64: File | string,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processSrc = (src: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while keeping aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src); // Fallback to original if context not available
          return;
        }

        // Fill background with white to handle transparent PNGs nicely when saving as JPEG
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = src;
    };

    if (fileOrBase64 instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          processSrc(e.target.result as string);
        } else {
          reject(new Error("Cannot read file"));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrBase64);
    } else {
      processSrc(fileOrBase64);
    }
  });
}

export interface TruckAllocationDetail {
  name: string;
  count: number;
  capacityKg: number;
}

export interface TruckOption {
  type: string;
  title: string;
  description: string;
  trucks: TruckAllocationDetail[];
  totalCapacity: number;
  efficiency: number;
}

export function getTruckAllocationOptions(weightKg: number): TruckOption[] {
  if (weightKg <= 0) return [];

  const trucksConfig = [
    { name: "รถบรรทุก 6 ล้อ", capacityKg: 7500 },
    { name: "รถบรรทุก 10 ล้อ", capacityKg: 13500 },
    { name: "รถบรรทุก 12 ล้อ", capacityKg: 16500 },
    { name: "รถเทเลอร์", capacityKg: 25000 },
    { name: "รถพ่วง", capacityKg: 31000 },
  ];

  const findSmallestTruckFor = (w: number) => {
    return trucksConfig.find((t) => t.capacityKg >= w) || trucksConfig[trucksConfig.length - 1];
  };

  const options: TruckOption[] = [];

  // 1. Optimal Large-First Mix (เน้นรถใหญ่ประหยัดค่าขนส่งต่อหน่วยสูงสุด)
  {
    const itemsMap: Record<string, number> = {};
    let rem = weightKg;
    
    // Fill with largest truck (รถพ่วง 31 ตัน)
    const largestCap = 31000;
    const numLargest = Math.floor(rem / largestCap);
    if (numLargest > 0) {
      itemsMap["รถพ่วง"] = numLargest;
      rem -= numLargest * largestCap;
    }
    
    if (rem > 0) {
      const smallestFit = findSmallestTruckFor(rem);
      itemsMap[smallestFit.name] = (itemsMap[smallestFit.name] || 0) + 1;
    }

    const trucks = Object.entries(itemsMap).map(([name, count]) => {
      const config = trucksConfig.find((t) => t.name === name)!;
      return { name, count, capacityKg: config.capacityKg };
    }).sort((a, b) => b.capacityKg - a.capacityKg);

    const totalCapacity = trucks.reduce((sum, t) => sum + (t.capacityKg * t.count), 0);
    const efficiency = totalCapacity > 0 ? (weightKg / totalCapacity) * 100 : 0;

    options.push({
      type: "optimal_large",
      title: "ชุดผสมเน้นรถใหญ่ (เที่ยววิ่งรวมน้อย คุ้มราคาต่อหน่วยสุด)",
      description: "เน้นการระบายน้ำหนักด้วยรถพ่วงเป็นหลัก แล้วใช้รถขนาดเล็กลงมารองรับเศษน้ำหนักที่เหลือ ช่วยลดจำนวนเที่ยวและค่าจ้างเฉลี่ยรวมได้ดีที่สุด",
      trucks,
      totalCapacity,
      efficiency,
    });
  }

  // 2. Optimal Medium-First Mix (เน้นรถขนาดกลางเพื่อความคล่องตัว เข้าซอยง่าย)
  {
    const itemsMap: Record<string, number> = {};
    let rem = weightKg;
    
    // Fill with medium truck (รถบรรทุก 10 ล้อ 13.5 ตัน)
    const medCap = 13500;
    const numMed = Math.floor(rem / medCap);
    if (numMed > 0) {
      itemsMap["รถบรรทุก 10 ล้อ"] = numMed;
      rem -= numMed * medCap;
    }
    
    if (rem > 0) {
      const smallestFit = findSmallestTruckFor(rem);
      itemsMap[smallestFit.name] = (itemsMap[smallestFit.name] || 0) + 1;
    }

    const trucks = Object.entries(itemsMap).map(([name, count]) => {
      const config = trucksConfig.find((t) => t.name === name)!;
      return { name, count, capacityKg: config.capacityKg };
    }).sort((a, b) => b.capacityKg - a.capacityKg);

    const totalCapacity = trucks.reduce((sum, t) => sum + (t.capacityKg * t.count), 0);
    const efficiency = totalCapacity > 0 ? (weightKg / totalCapacity) * 100 : 0;

    options.push({
      type: "optimal_medium",
      title: "ชุดผสมเน้นรถ 10 ล้อ (คล่องตัวสูง เข้าซอกซอยหรือหน้างานแคบ)",
      description: "เลือกกรณีทางเข้าโครงการก่อสร้างจำกัดความกว้าง รถเทเลอร์ใหญ่เข้าไม่ได้ โดยจะจัดสรรรถ 10 ล้อเป็นหลัก และเติมเต็มเศษน้ำหนักด้วยรถ 6 ล้อ",
      trucks,
      totalCapacity,
      efficiency,
    });
  }

  // 3. Single Uniform Truck Options (ใช้รถประเภทเดียวกันวิ่งซ้ำ)
  trucksConfig.forEach((config) => {
    const count = Math.ceil(weightKg / config.capacityKg);
    if (count <= 12) {
      const totalCapacity = config.capacityKg * count;
      const efficiency = (weightKg / totalCapacity) * 100;
      options.push({
        type: `uniform_${config.capacityKg}`,
        title: `ใช้เฉพาะ ${config.name} (ทั้งหมดจำนวน ${count} คัน/เที่ยว)`,
        description: `ใช้เฉพาะรถบรรทุกประเภท ${config.name} วิ่งบรรทุกเป็นขบวนเดียว ง่ายต่อการควบคุม ดูแลหน้างาน และจัดเอกสารใบนำส่งทางเดียว`,
        trucks: [{ name: config.name, count, capacityKg: config.capacityKg }],
        totalCapacity,
        efficiency,
      });
    }
  });

  return options;
}

