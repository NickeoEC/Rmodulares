"use client";

import React, { useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  useConfiguratorStore,
  SelectedMaterial,
  SelectedSize,
} from "@/store/useConfiguratorStore";
import { useCartStore } from "@/store/useCartStore";
import { FurnitureCanvas } from "@/components/three/FurnitureCanvas";
import { ARLauncher } from "@/components/three/ARLauncher";

interface MeshZoneData {
  id: string;
  zoneLabel: string;
  meshNodeName: string;
  defaultMaterialId: string;
  allowedMaterials: (SelectedMaterial & { skuCode: string })[];
}

interface VariantSkuData {
  id: string;
  sku: string;
  configurationHash: string;
  stockQuantity: number;
  priceOverrideUsd: number | null;
}

interface ProductConfiguratorClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    subtitle?: string | null;
    description: string;
    categoryName: string;
    basePriceUsd: number;
    baseLeadTimeDays: number;
    modelGlbUrl: string;
    modelUsdzUrl?: string | null;
    primaryImageUrl: string;
    sizeOptions: (SelectedSize & { code: string; isDefault: boolean })[];
    meshZones: MeshZoneData[];
    stockVariants: VariantSkuData[];
  };
}

export function ProductConfiguratorClient({
  product,
}: ProductConfiguratorClientProps) {
  const {
    selectedSize,
    meshMaterials,
    matchedVariantSku,
    initProductConfig,
    setSelectedSize,
    setMeshMaterial,
    setMatchedVariantSku,
    getComputedPriceUsd,
    getComputedLeadTimeDays,
  } = useConfiguratorStore();

  const addItemToCart = useCartStore((s) => s.addItem);

  // 1. Inicializar el Configurador con los valores por defecto del producto
  useEffect(() => {
    const defaultSize =
      product.sizeOptions.find((s) => s.isDefault) || product.sizeOptions[0];

    const initialMaterials: Record<string, SelectedMaterial> = {};
    product.meshZones.forEach((zone) => {
      const defMat =
        zone.allowedMaterials.find((m) => m.id === zone.defaultMaterialId) ||
        zone.allowedMaterials[0];
      if (defMat) {
        initialMaterials[zone.meshNodeName] = defMat;
      }
    });

    if (defaultSize) {
      initProductConfig({
        basePriceUsd: product.basePriceUsd,
        baseLeadTimeDays: product.baseLeadTimeDays,
        defaultSize,
        defaultMaterials: initialMaterials,
      });
    }
  }, [product, initProductConfig]);

  // 2. Evaluar automáticamente si la combinación activa existe en Stock Físico (SKU)
  useEffect(() => {
    if (!selectedSize) return;

    const currentSizeObj = product.sizeOptions.find(
      (s) => s.id === selectedSize.id
    );
    if (!currentSizeObj) return;

    // Construimos el hash igual que en el seed: "SZ-200__mesh_tapiz:MAT-FAB-LINO-ARENA__mesh_estructura:MAT-WOD-ROBLE"
    const materialParts = product.meshZones.map((zone) => {
      const activeMat = meshMaterials[zone.meshNodeName];
      const fullMat = zone.allowedMaterials.find((m) => m.id === activeMat?.id);
      return `${zone.meshNodeName}:${fullMat?.skuCode || ""}`;
    });

    const candidateHash = `${currentSizeObj.code}__${materialParts.join("__")}`;

    const foundSku = product.stockVariants.find(
      (v) => v.configurationHash === candidateHash && v.stockQuantity > 0
    );

    setMatchedVariantSku(foundSku || null);
  }, [
    selectedSize,
    meshMaterials,
    product.sizeOptions,
    product.meshZones,
    product.stockVariants,
    setMatchedVariantSku,
  ]);

  const finalPriceUsd = getComputedPriceUsd();
  const leadTimeInfo = getComputedLeadTimeDays();

  const handleAddToCart = () => {
    if (!selectedSize) return;

    const readableMaterials: Record<string, string> = {};
    product.meshZones.forEach((zone) => {
      const mat = meshMaterials[zone.meshNodeName];
      if (mat) readableMaterials[zone.zoneLabel] = mat.name;
    });

    const configKey = `${product.id}-${selectedSize.id}-${Object.values(
      meshMaterials
    )
      .map((m) => m.id)
      .join("-")}`;

    addItemToCart({
      cartItemId: configKey,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      unitPriceUsd: finalPriceUsd,
      quantity: 1,
      imageUrl: product.primaryImageUrl,
      isMadeToOrder: !leadTimeInfo.isInStock,
      estimatedLeadTimeDays: leadTimeInfo.days,
      widthCm: selectedSize.widthCm,
      heightCm: selectedSize.heightCm,
      depthCm: selectedSize.depthCm,
      weightKg: selectedSize.weightKg,
      customConfiguration: {
        sizeLabel: selectedSize.label,
        materials: readableMaterials,
      },
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* COLUMNA IZQUIERDA (7 cols): VISOR 3D INTERACTIVO Y AR */}
        <div className="lg:col-span-7">
          <div className="sticky top-28">
            <FurnitureCanvas
              modelGlbUrl={product.modelGlbUrl}
              productName={product.name}
            />
            <ARLauncher
              productName={product.name}
              modelGlbUrl={product.modelGlbUrl}
              modelUsdzUrl={product.modelUsdzUrl}
            />
          </div>
        </div>

        {/* COLUMNA DERECHA (5 cols): CONTROLES DEL CONFIGURADOR HÍBRIDO */}
        <div className="lg:col-span-5">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {product.categoryName} · Configurador Modular
          </p>
          <h1 className="mt-2 font-serif text-4xl font-normal text-foreground sm:text-5xl">
            {product.name}
          </h1>
          {product.subtitle && (
            <p className="mt-2 text-sm text-muted">{product.subtitle}</p>
          )}

          {/* Precio Dinámico y Estado de Inventario Híbrido */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
            <div>
              <span className="font-mono text-xs uppercase text-muted">
                Precio Configurado
              </span>
              <p className="font-mono text-3xl font-medium text-foreground">
                ${finalPriceUsd.toFixed(2)}{" "}
                <span className="text-sm text-muted">USD</span>
              </p>
            </div>

            {leadTimeInfo.isInStock && matchedVariantSku ? (
              <div className="border border-emerald-600/30 bg-emerald-500/10 px-3.5 py-2 text-right">
                <div className="flex items-center justify-end gap-1.5 font-mono text-xs font-medium uppercase text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  En Stock ({matchedVariantSku.stockQuantity} disp.)
                </div>
                <p className="font-mono text-[11px] text-muted">
                  SKU: {matchedVariantSku.sku} · Despacho 48h
                </p>
              </div>
            ) : (
              <div className="border border-accent/40 bg-accent/10 px-3.5 py-2 text-right">
                <div className="flex items-center justify-end gap-1.5 font-mono text-xs font-medium uppercase text-accent">
                  <Clock className="h-4 w-4" />
                  Fabricación a Medida
                </div>
                <p className="font-mono text-[11px] text-muted">
                  Tiempo estimado: {leadTimeInfo.days} días hábiles
                </p>
              </div>
            )}
          </div>

          {/* 1. SELECTOR DE DIMENSIONES / MÓDULO */}
          <div className="mt-6">
            <label className="block font-mono text-xs uppercase tracking-widest text-foreground">
              1. Dimensiones del Módulo
            </label>
            <div className="mt-3 grid grid-cols-1 gap-2.5">
              {product.sizeOptions.map((size) => {
                const isSelected = selectedSize?.id === size.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`flex items-center justify-between border p-3.5 text-left transition ${
                      isSelected
                        ? "border-foreground bg-surface font-medium text-foreground"
                        : "border-border bg-background text-muted hover:border-foreground/50"
                    }`}
                  >
                    <div>
                      <p className="text-sm text-foreground">{size.label}</p>
                      <p className="font-mono text-[11px] text-muted">
                        {size.widthCm} × {size.depthCm} × {size.heightCm} cm ·{" "}
                        {size.weightKg} kg
                      </p>
                    </div>
                    <span className="font-mono text-xs text-accent">
                      {size.priceDeltaUsd > 0
                        ? `+$${size.priceDeltaUsd.toFixed(2)} USD`
                        : "Base"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SELECTORES DE MATERIALES PBR POR ZONA DE MALLA 3D */}
          {product.meshZones.map((zone, index) => {
            const activeMat = meshMaterials[zone.meshNodeName];
            return (
              <div key={zone.id} className="mt-6">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs uppercase tracking-widest text-foreground">
                    {index + 2}. {zone.zoneLabel}
                  </label>
                  <span className="font-mono text-xs text-accent">
                    {activeMat?.name}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {zone.allowedMaterials.map((mat) => {
                    const isSelected = activeMat?.id === mat.id;
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => setMeshMaterial(zone.meshNodeName, mat)}
                        className={`flex items-center gap-3 border p-3 text-left transition ${
                          isSelected
                            ? "border-foreground bg-surface"
                            : "border-border bg-background hover:border-foreground/40"
                        }`}
                      >
                        <span
                          style={{ backgroundColor: mat.colorHex }}
                          className="h-7 w-7 shrink-0 rounded-full border border-border shadow-inner"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">
                            {mat.name}
                          </p>
                          <p className="font-mono text-[11px] text-muted">
                            {mat.priceDeltaUsd > 0
                              ? `+$${mat.priceDeltaUsd.toFixed(2)}`
                              : "Incluido"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* CTA AÑADIR AL CARRITO */}
          <div className="mt-8">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-3 bg-foreground py-4 text-xs font-medium uppercase tracking-widest text-background transition hover:bg-accent hover:text-white"
            >
              <ShoppingBag className="h-4 w-4" />
              Añadir Configuración al Carrito — ${finalPriceUsd.toFixed(2)} USD
            </button>
          </div>

          {/* Descripción y Garantías */}
          <div className="mt-8 space-y-4 border-t border-border pt-6 text-xs leading-relaxed text-muted">
            <p>{product.description}</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-foreground">
                <Truck className="h-4 w-4 text-accent" />
                <span>Logística especializada en todo el Ecuador</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span>Garantía estructural de 5 años</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}