"use client";

import React, { useEffect, useState } from "react";
import {
  PackageCheck,
  AlertTriangle,
  Plus,
  Minus,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function AdminInventarioPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/inventory");
    const data = await res.json();
    if (data.products) setProducts(data.products);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleAdjustSkuStock = async (sku: any, newQty: number) => {
    const safeQty = Math.max(0, newQty);
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "UPDATE_SKU_STOCK",
        skuId: sku.id,
        stockQuantity: safeQty,
        priceOverrideUsd: sku.priceOverrideUsd,
      }),
    });

    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          stockVariants: p.stockVariants.map((s: any) =>
            s.id === sku.id ? { ...s, stockQuantity: safeQty } : s
          ),
        }))
      );
      showToast(`Stock de ${sku.sku} actualizado a ${safeQty} uds.`);
    }
  };

  const handleUpdateLeadTime = async (
    productId: string,
    baseLeadTimeDays: number,
    inventoryMode: string
  ) => {
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "UPDATE_PRODUCT_LEADTIME",
        productId,
        baseLeadTimeDays,
        inventoryMode,
      }),
    });

    if (res.ok) {
      showToast("Modo de inventario y tiempo de fabricación actualizados.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Almacén Físico & Tiempos de Taller
          </p>
          <h1 className="mt-1 font-serif text-4xl font-normal">
            Control Rápido de Stock e Inventario Híbrido
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`inline-flex items-center gap-2 border px-4 py-2.5 font-mono text-xs uppercase transition ${
            onlyLowStock
              ? "border-amber-500 bg-amber-500/15 text-amber-600"
              : "border-border bg-surface text-foreground"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          {onlyLowStock
            ? "Mostrando solo Stock Bajo (≤ 3)"
            : "Filtrar Alertas de Stock Bajo"}
        </button>
      </div>

      {toastMsg && (
        <div className="flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center font-mono text-xs uppercase text-muted">
          Cargando inventario...
        </p>
      ) : (
        <div className="space-y-6">
          {products.map((product) => {
            const visibleSkus = onlyLowStock
              ? product.stockVariants.filter((s: any) => s.stockQuantity <= 3)
              : product.stockVariants;

            if (onlyLowStock && visibleSkus.length === 0) return null;

            return (
              <div
                key={product.id}
                className="border border-border bg-surface p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                      {product.category?.name}
                    </span>
                    <h2 className="font-serif text-2xl font-medium">
                      {product.name}
                    </h2>
                  </div>

                  {/* Controles rápidos de Modo y Días de Fabricación */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-muted">
                        Modo:
                      </span>
                      <select
                        value={product.inventoryMode}
                        onChange={(e) => {
                          const newMode = e.target.value;
                          setProducts((prev) =>
                            prev.map((p) =>
                              p.id === product.id
                                ? { ...p, inventoryMode: newMode }
                                : p
                            )
                          );
                          handleUpdateLeadTime(
                            product.id,
                            product.baseLeadTimeDays,
                            newMode
                          );
                        }}
                        className="border border-border bg-background px-2.5 py-1.5 font-mono text-xs"
                      >
                        <option value="HYBRID">HYBRID</option>
                        <option value="STOCK_SKU">STOCK_SKU</option>
                        <option value="MADE_TO_ORDER">MADE_TO_ORDER</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      <span className="font-mono text-[11px] text-muted">
                        Fabricación (días):
                      </span>
                      <input
                        type="number"
                        value={product.baseLeadTimeDays}
                        onChange={(e) => {
                          const days = Number(e.target.value);
                          setProducts((prev) =>
                            prev.map((p) =>
                              p.id === product.id
                                ? { ...p, baseLeadTimeDays: days }
                                : p
                            )
                          );
                        }}
                        onBlur={() =>
                          handleUpdateLeadTime(
                            product.id,
                            product.baseLeadTimeDays,
                            product.inventoryMode
                          )
                        }
                        className="w-16 border border-border bg-background px-2 py-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Tabla de Variantes SKU en Almacén */}
                <div className="mt-4 space-y-2">
                  {visibleSkus.length === 0 ? (
                    <p className="font-mono text-xs text-muted">
                      Sin SKUs físicos registrados (Opera 100% Bajo Pedido).
                    </p>
                  ) : (
                    visibleSkus.map((sku: any) => (
                      <div
                        key={sku.id}
                        className="flex flex-wrap items-center justify-between gap-4 border border-border bg-background px-4 py-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-foreground">
                              {sku.sku}
                            </span>
                            {sku.stockQuantity <= 2 && (
                              <span className="border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase text-amber-600">
                                Stock Crítico
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[11px] text-muted">
                            Combinación 3D: {sku.configurationHash}
                          </p>
                        </div>

                        {/* Botones + / - de ajuste instantáneo */}
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-muted">
                            Unidades disponibles:
                          </span>
                          <div className="flex items-center border border-border bg-surface">
                            <button
                              type="button"
                              onClick={() =>
                                handleAdjustSkuStock(
                                  sku,
                                  sku.stockQuantity - 1
                                )
                              }
                              className="p-2 text-muted hover:text-foreground"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-12 text-center font-mono text-sm font-medium">
                              {sku.stockQuantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleAdjustSkuStock(
                                  sku,
                                  sku.stockQuantity + 1
                                )
                              }
                              className="p-2 text-muted hover:text-foreground"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}