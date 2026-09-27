"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Save, Truck, Scale, MapPin, Gift } from "lucide-react";

type StrategyType =
  | "FLAT_BY_LOCATION"
  | "FREE_OVER_AMOUNT"
  | "WEIGHT_VOLUME";

export default function AdminShippingSettingsPage() {
  const [strategy, setStrategy] = useState<StrategyType>("FLAT_BY_LOCATION");
  const [ivaPercent, setIvaPercent] = useState(15);
  const [freeShippingThresholdUsd, setFreeShippingThresholdUsd] = useState(800);
  const [fallbackBaseShippingUsd, setFallbackBaseShippingUsd] = useState(35);
  const [baseDispatchFeeUsd, setBaseDispatchFeeUsd] = useState(12);
  const [costPerKgUsd, setCostPerKgUsd] = useState(0.45);
  const [costPerCubicMeterUsd, setCostPerCubicMeterUsd] = useState(40);
  const [zones, setZones] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/shipping-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setStrategy(data.settings.activeShippingStrategy);
          setIvaPercent(Number(data.settings.ivaPercent));
          setFreeShippingThresholdUsd(
            Number(data.settings.freeShippingThresholdUsd)
          );
          setFallbackBaseShippingUsd(
            Number(data.settings.fallbackBaseShippingUsd)
          );
          setBaseDispatchFeeUsd(Number(data.settings.baseDispatchFeeUsd));
          setCostPerKgUsd(Number(data.settings.costPerKgUsd));
          setCostPerCubicMeterUsd(Number(data.settings.costPerCubicMeterUsd));
        }
        if (data.zones) setZones(data.zones);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const res = await fetch("/api/admin/shipping-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activeShippingStrategy: strategy,
        ivaPercent,
        freeShippingThresholdUsd,
        fallbackBaseShippingUsd,
        baseDispatchFeeUsd,
        costPerKgUsd,
        costPerCubicMeterUsd,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Rol Administrador · Motor Logístico Ecuador
        </p>
        <h1 className="mt-1 font-serif text-4xl font-normal">
          Configuración de Reglas de Envío e Impuestos
        </h1>
        <p className="mt-2 text-xs text-muted">
          Selecciona qué algoritmo de cálculo de envío se aplica en tiempo real
          en el Checkout de la tienda.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 border border-emerald-600/40 bg-emerald-500/10 p-4 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            Configuración guardada. El Checkout ya está calculando envíos con la
            nueva regla activa.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* SELECTOR DE LAS 3 ESTRATEGIAS */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-foreground">
            1. Elige la Estrategia de Cálculo Activa
          </label>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Opción 1 */}
            <button
              type="button"
              onClick={() => setStrategy("FLAT_BY_LOCATION")}
              className={`flex flex-col justify-between border p-5 text-left transition ${
                strategy === "FLAT_BY_LOCATION"
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface hover:border-foreground/40"
              }`}
            >
              <div>
                <MapPin className="h-5 w-5 text-accent" />
                <h3 className="mt-3 font-serif text-xl font-medium">
                  1. Tarifa Fija por Zona
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Aplica el valor fijo asignado a cada Provincia o Cantón del
                  Ecuador sin importar el tamaño del pedido.
                </p>
              </div>
              <span className="mt-4 font-mono text-[11px] uppercase text-accent">
                {strategy === "FLAT_BY_LOCATION" ? "● Activa" : "Seleccionar"}
              </span>
            </button>

            {/* Opción 2 */}
            <button
              type="button"
              onClick={() => setStrategy("FREE_OVER_AMOUNT")}
              className={`flex flex-col justify-between border p-5 text-left transition ${
                strategy === "FREE_OVER_AMOUNT"
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface hover:border-foreground/40"
              }`}
            >
              <div>
                <Gift className="h-5 w-5 text-accent" />
                <h3 className="mt-3 font-serif text-xl font-medium">
                  2. Gratis sobre Monto $X
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Otorga envío gratuito ($0 USD) si el subtotal supera el umbral
                  definido; caso contrario cobra la tarifa zonal.
                </p>
              </div>
              <span className="mt-4 font-mono text-[11px] uppercase text-accent">
                {strategy === "FREE_OVER_AMOUNT" ? "● Activa" : "Seleccionar"}
              </span>
            </button>

            {/* Opción 3 */}
            <button
              type="button"
              onClick={() => setStrategy("WEIGHT_VOLUME")}
              className={`flex flex-col justify-between border p-5 text-left transition ${
                strategy === "WEIGHT_VOLUME"
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface hover:border-foreground/40"
              }`}
            >
              <div>
                <Scale className="h-5 w-5 text-accent" />
                <h3 className="mt-3 font-serif text-xl font-medium">
                  3. Peso (kg) y Volumen (m³)
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Calcula exactamente según las dimensiones configuradas en 3D
                  (m³) y el peso en kg multiplicado por la distancia provincial.
                </p>
              </div>
              <span className="mt-4 font-mono text-[11px] uppercase text-accent">
                {strategy === "WEIGHT_VOLUME" ? "● Activa" : "Seleccionar"}
              </span>
            </button>
          </div>
        </div>

        {/* PARÁMETROS CONFIGURABLES */}
        <div className="border border-border bg-surface p-6">
          <h2 className="font-serif text-2xl font-normal">
            2. Parámetros Financieros y Fórmulas (USD)
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block font-mono text-xs uppercase text-muted">
                IVA Vigente Ecuador (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={ivaPercent}
                onChange={(e) => setIvaPercent(Number(e.target.value))}
                className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-muted">
                Umbral Envío Gratis ($ USD)
              </label>
              <input
                type="number"
                step="10"
                value={freeShippingThresholdUsd}
                onChange={(e) =>
                  setFreeShippingThresholdUsd(Number(e.target.value))
                }
                className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-muted">
                Tarifa Base Otras Provincias ($)
              </label>
              <input
                type="number"
                step="1"
                value={fallbackBaseShippingUsd}
                onChange={(e) =>
                  setFallbackBaseShippingUsd(Number(e.target.value))
                }
                className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-muted">
                Base Despacho Camión ($ USD)
              </label>
              <input
                type="number"
                step="1"
                value={baseDispatchFeeUsd}
                onChange={(e) => setBaseDispatchFeeUsd(Number(e.target.value))}
                className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-muted">
                Costo por Kilogramo ($ / kg)
              </label>
              <input
                type="number"
                step="0.05"
                value={costPerKgUsd}
                onChange={(e) => setCostPerKgUsd(Number(e.target.value))}
                className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-muted">
                Costo por Metro Cúbico ($ / m³)
              </label>
              <input
                type="number"
                step="1"
                value={costPerCubicMeterUsd}
                onChange={(e) =>
                  setCostPerCubicMeterUsd(Number(e.target.value))
                }
                className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* TABLA DE ZONAS DEL SEED */}
        <div className="border border-border bg-surface p-6">
          <h2 className="font-serif text-2xl font-normal">
            Tarifas Zonales Configuradas por Provincia / Cantón
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {zones.map((z) => (
              <div
                key={z.id}
                className="flex items-center justify-between border border-border bg-background px-3.5 py-2.5 text-xs"
              >
                <span>
                  <strong>{z.province}</strong> ({z.canton})
                </span>
                <span className="font-mono text-accent">
                  ${Number(z.flatRateUsd).toFixed(2)} USD · Factor x
                  {z.zoneMultiplier}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-foreground px-8 py-4 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-accent hover:text-white"
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar y Aplicar Regla en la Tienda"}
        </button>
      </form>
    </div>
  );
}