/**
 * Core Concrete & Structural Calculation Engine for Pongsakul Concrete Calculator
 * 
 * Centralizes all engineering formulas and mathematical rules for:
 * 1. Precast prestressed concrete slabs (สูตรคำนวณแผ่นพื้นอัดแรง สเต็ปราคาตามจำนวนลวด)
 * 2. Item weight computations (สูตรคำนวณน้ำหนักคอนกรีตตามมาตรฐานโรงงาน)
 * 3. Area, volume, and unit conversions
 * 
 * Keeping this isolated and strictly typed ensures calculations remain 100% accurate
 * and cannot be accidentally modified or broken during database updates or catalog edits.
 */

import { Prices, Weights } from "../types";

/**
 * Standard Slab Step Price calculation based on board type and wire count.
 * Standard width: 0.35 m (35 cm).
 * 
 * Step additions:
 * Normal board:
 *   - 4 wires: basePrice
 *   - 5 wires: basePrice + 10
 *   - 6 wires: basePrice + 20
 *   - 7 wires: basePrice + 35
 *   - 8 wires: basePrice + 55
 *   - 5 mm (wire 5): basePrice + 55
 * 
 * M.O.C. board:
 *   - 4 wires: basePrice
 *   - 5 wires: basePrice + 15
 *   - 6 wires: basePrice + 30
 *   - 7 wires: basePrice + 50
 *   - 8 wires: basePrice + 75
 *   - 5 mm (wire 5): basePrice + 75
 */
export function calculateSlabStepPrice(
  boardType: string,
  wireCount: string,
  prices: Prices,
  customBasePrice?: number
): number {
  const isMoc = boardType === "m.o.c" || boardType === "m.o.c_custom";
  const defaultBasePrice = isMoc ? (prices.mocBoardPrice || 230) : (prices.normalBoardPrice || 210);
  const basePrice = (customBasePrice && customBasePrice > 0) ? customBasePrice : defaultBasePrice;

  if (isMoc) {
    switch (wireCount) {
      case "4": return basePrice;
      case "5": return basePrice + 15;
      case "6": return basePrice + 30;
      case "7": return basePrice + 50;
      case "8": return basePrice + 75;
      case "5_mm_5": return basePrice + 75;
      default: return basePrice;
    }
  } else {
    // Normal or custom normal
    switch (wireCount) {
      case "4": return basePrice;
      case "5": return basePrice + 10;
      case "6": return basePrice + 20;
      case "7": return basePrice + 35;
      case "8": return basePrice + 55;
      case "5_mm_5": return basePrice + 55;
      default: return basePrice;
    }
  }
}

/**
 * Calculates total piece price for a single prestressed concrete slab.
 * Formula: 0.35m * stepPrice (THB/sq.m.) * length (m)
 */
export function calculateSlabPiecePrice(
  length: number,
  stepPrice: number
): number {
  if (length <= 0 || stepPrice <= 0) return 0;
  return 0.35 * stepPrice * length;
}

/**
 * Calculates area in square meters (sq.m.) for a single slab piece or multiple slabs.
 * Standard slab width = 0.35 m
 */
export function calculateSlabAreaSqm(length: number, count: number = 1): number {
  if (length <= 0 || count <= 0) return 0;
  return 0.35 * length * count;
}

/**
 * Calculates weight for standard concrete elements based on current factory weight specs.
 */
export function calculateStandardItemWeight(
  type: string,
  length: number,
  count: number,
  weights: Weights
): number {
  if (length <= 0 || count <= 0) return 0;

  const wKey = type as keyof Weights;
  const unitWeight = weights[wKey];
  if (typeof unitWeight === "number") {
    // If it's a pipe or basin, unit weight is per piece, length is 1
    if (type.startsWith("pipe") || type.startsWith("basin")) {
      return unitWeight * count;
    }
    // For linear elements (slabs, piles, fence posts) weight is kg/m * length * count
    return unitWeight * length * count;
  }

  // Fallback default slab weight: 42 kg/m
  return 42 * length * count;
}
