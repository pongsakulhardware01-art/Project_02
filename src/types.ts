export interface Prices {
  normalBoardPrice: number;
  mocBoardPrice: number;
  i15Price: number;
  // I-18
  i18NoTISPrice: number;
  i18TISPrice: number;
  i18JointPrice: number;
  i18TISJointPrice: number;
  // I-22
  i22NoTISPrice: number;
  i22TISPrice: number;
  i22JointPrice: number;
  i22TISJointPrice: number;
  // Others
  i26NoTISPrice: number;
  i26NoTISJointPrice: number;
  i26TISPrice: number;
  i26TISJointPrice: number;
  i30NoTISPrice: number;
  i30NoTISJointPrice: number;
  i30TISPrice: number;
  i30TISJointPrice: number;
  i35TISPrice: number;
  i35TISJointPrice: number;
  i40TISPrice: number;
  i40TISJointPrice: number;
  hexPilePrice: number;
  // S-Piles (Solid Square Piles)
  s18Price: number;
  s18JointPrice: number;
  s22Price: number;
  s22JointPrice: number;
  s26Price: number;
  s26JointPrice: number;
  s30Price: number;
  s30JointPrice: number;
  s35Price: number;
  s35JointPrice: number;
  s40Price: number;
  s40JointPrice: number;
  fence3Price: number;
  fence4Price: number;
  hcPriceSqm: number;
  vatPercent: number;
}

export interface Weights {
  slab: number;
  fence3: number;
  fence4: number;
  hex: number;
  i15: number;
  i18_no_tis: number;
  i18_tis: number;
  i22_no_tis: number;
  i22_tis: number;
  i26_no_tis: number;
  i26_tis: number;
  i30_no_tis: number;
  i30_tis: number;
  i35: number;
  i40: number;
  s18: number;
  s22: number;
  s26: number;
  s30: number;
  s35: number;
  s40: number;
}

export interface AppSettings {
  prices: Prices;
  weights: Weights;
}

export interface WeightItem {
  id: string;
  type: string;
  count: number | "";
  length: number | "";
  unitWeight?: number | "";
}
