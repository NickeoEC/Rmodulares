import { create } from "zustand";

export interface SelectedMaterial {
  id: string;
  name: string;
  colorHex: string;
  albedoMapUrl?: string | null;
  normalMapUrl?: string | null;
  roughnessMapUrl?: string | null;
  roughnessFactor: number;
  metalnessFactor: number;
  textureRepeat: number;
  priceDeltaUsd: number;
  extraLeadDays: number;
}

export interface SelectedSize {
  id: string;
  label: string;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  weightKg: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  priceDeltaUsd: number;
}

interface ConfiguratorState {
  basePriceUsd: number;
  baseLeadTimeDays: number;
  selectedSize: SelectedSize | null;
  // Mapa: { [meshNodeName: string]: SelectedMaterial }
  meshMaterials: Record<string, SelectedMaterial>;
  matchedVariantSku: { id: string; sku: string; stockQuantity: number; priceOverrideUsd?: number | null } | null;

  // Acciones
  initProductConfig: (payload: {
    basePriceUsd: number;
    baseLeadTimeDays: number;
    defaultSize: SelectedSize;
    defaultMaterials: Record<string, SelectedMaterial>;
  }) => void;
  setMeshMaterial: (meshNodeName: string, material: SelectedMaterial) => void;
  setSelectedSize: (size: SelectedSize) => void;
  setMatchedVariantSku: (skuData: ConfiguratorState["matchedVariantSku"]) => void;
  getComputedPriceUsd: () => number;
  getComputedLeadTimeDays: () => { isInStock: boolean; days: number };
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  basePriceUsd: 0,
  baseLeadTimeDays: 15,
  selectedSize: null,
  meshMaterials: {},
  matchedVariantSku: null,

  initProductConfig: ({ basePriceUsd, baseLeadTimeDays, defaultSize, defaultMaterials }) =>
    set({
      basePriceUsd,
      baseLeadTimeDays,
      selectedSize: defaultSize,
      meshMaterials: defaultMaterials,
      matchedVariantSku: null,
    }),

  setMeshMaterial: (meshNodeName, material) =>
    set((state) => ({
      meshMaterials: { ...state.meshMaterials, [meshNodeName]: material },
    })),

  setSelectedSize: (size) => set({ selectedSize: size }),

  setMatchedVariantSku: (skuData) => set({ matchedVariantSku: skuData }),

  getComputedPriceUsd: () => {
    const { basePriceUsd, selectedSize, meshMaterials, matchedVariantSku } = get();
    if (matchedVariantSku?.priceOverrideUsd) {
      return Number(matchedVariantSku.priceOverrideUsd);
    }
    const sizeDelta = selectedSize?.priceDeltaUsd ?? 0;
    const materialsDelta = Object.values(meshMaterials).reduce(
      (acc, mat) => acc + Number(mat.priceDeltaUsd || 0),
      0
    );
    return Number((basePriceUsd + sizeDelta + materialsDelta).toFixed(2));
  },

  getComputedLeadTimeDays: () => {
    const { baseLeadTimeDays, meshMaterials, matchedVariantSku } = get();
    if (matchedVariantSku && matchedVariantSku.stockQuantity > 0) {
      return { isInStock: true, days: 2 }; // Entrega inmediata 48h
    }
    const extraDays = Object.values(meshMaterials).reduce(
      (max, mat) => Math.max(max, mat.extraLeadDays || 0),
      0
    );
    return { isInStock: false, days: baseLeadTimeDays + extraDays };
  },
}));