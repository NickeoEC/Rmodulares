"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import {
  ECUADOR_LOCATIONS,
  validateBillingIdentification,
  IdType,
} from "@/lib/ecuador-validators";

interface QuoteData {
  appliedStrategy: string;
  subtotalUsd: number;
  shippingCostUsd: number;
  ivaPercent: number;
  ivaAmountUsd: number;
  totalUsd: number;
  totalWeightKg: number;
  totalVolumeCubicMeters: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  explanationLabel: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();

  // Datos de Facturación SRI Ecuador
  const [billingIdType, setBillingIdType] = useState<IdType>("CEDULA");
  const [billingIdNumber, setBillingIdNumber] = useState("1710034065");
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  // Dirección de Entrega
  const provinces = Object.keys(ECUADOR_LOCATIONS);
  const [shippingProvince, setShippingProvince] = useState("Pichincha");
  const [shippingCanton, setShippingCanton] = useState("Quito");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingReference, setShippingReference] = useState("");

  // Cotización de Envío Dinámica
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const idValidation = validateBillingIdentification(
    billingIdType,
    billingIdNumber
  );

  // Actualizar cantón por defecto al cambiar provincia
  const handleProvinceChange = (prov: string) => {
    setShippingProvince(prov);
    const firstCanton = ECUADOR_LOCATIONS[prov]?.[0] || "*";
    setShippingCanton(firstCanton);
  };

  // Recalcular envío en tiempo real cuando cambia Provincia, Cantón o Ítems
  useEffect(() => {
    if (items.length === 0) return;

    let active = true;
    setLoadingQuote(true);

    fetch("/api/shipping/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        province: shippingProvince,
        canton: shippingCanton,
        items,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (active && !data.error) {
          setQuote(data);
        }
      })
      .finally(() => {
        if (active) setLoadingQuote(false);
      });

    return () => {
      active = false;
    };
  }, [shippingProvince, shippingCanton, items]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!idValidation.valid) {
      setErrorMsg(idValidation.error || "Identificación inválida.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingIdType,
          billingIdNumber,
          billingName,
          billingEmail,
          billingPhone,
          billingAddress,
          shippingProvince,
          shippingCanton,
          shippingStreet,
          shippingReference,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Error al procesar la orden.");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/checkout/confirmacion/${data.orderId}`);
    } catch {
      setErrorMsg("Error de red al conectar con el servidor.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-4xl text-foreground">
          No tienes piezas en tu carrito
        </h1>
        <Link
          href="/catalogo"
          className="mt-6 inline-block bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background"
        >
          Ir al Catálogo 3D
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Checkout Seguro en USD · Facturación Electrónica Ecuador
        </p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-foreground">
          Finalizar Pedido y Logística
        </h1>
      </div>

      {errorMsg && (
        <div className="mt-6 flex items-center gap-2 border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form
        onSubmit={handlePlaceOrder}
        className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12"
      >
        {/* COLUMNA IZQUIERDA (7 cols): DATOS DE FACTURACIÓN Y DIRECCIÓN */}
        <div className="space-y-10 lg:col-span-7">
          {/* 1. Facturación SRI */}
          <section className="border border-border bg-surface p-6">
            <h2 className="font-serif text-2xl font-normal text-foreground">
              1. Datos de Facturación (SRI Ecuador)
            </h2>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {(["CEDULA", "RUC", "PASAPORTE"] as IdType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBillingIdType(type)}
                  className={`border py-2.5 font-mono text-xs uppercase transition ${
                    billingIdType === type
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs uppercase text-muted">
                  Número de {billingIdType}
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    value={billingIdNumber}
                    onChange={(e) => setBillingIdNumber(e.target.value)}
                    className="w-full border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5">
                    {idValidation.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </span>
                </div>
                {!idValidation.valid && (
                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                    {idValidation.error}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-muted">
                  Nombres Completos / Razón Social
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez / Estudio Arquitectura S.A."
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  className="mt-1 w-full border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-muted">
                  Correo para Factura Electrónica
                </label>
                <input
                  type="email"
                  required
                  placeholder="cliente@correo.ec"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="mt-1 w-full border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-muted">
                  Teléfono Celular (WhatsApp Logística)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0991234567"
                  value={billingPhone}
                  onChange={(e) => setBillingPhone(e.target.value)}
                  className="mt-1 w-full border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-xs uppercase text-muted">
                  Dirección Fiscal
                </label>
                <input
                  type="text"
                  required
                  placeholder="Av. República E7-123 y Pradera"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="mt-1 w-full border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* 2. Dirección de Entrega y Cálculo de Envío */}
          <section className="border border-border bg-surface p-6">
            <h2 className="font-serif text-2xl font-normal text-foreground">
              2. Ubicación de Entrega en Ecuador
            </h2>
            <p className="mt-1 text-xs text-muted">
              Al seleccionar tu Provincia y Cantón calculamos el transporte en
              tiempo real según la regla activa de la tienda.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs uppercase text-muted">
                  Provincia
                </label>
                <select
                  value={shippingProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="mt-1 w-full border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                >
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-muted">
                  Cantón / Ciudad
                </label>
                <select
                  value={shippingCanton}
                  onChange={(e) => setShippingCanton(e.target.value)}
                  className="mt-1 w-full border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                >
                  {(ECUADOR_LOCATIONS[shippingProvince] || []).map((canton) => (
                    <option key={canton} value={canton}>
                      {canton}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-xs uppercase text-muted">
                  Calle Principal, Numeración y Calle Secundaria
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Av. De los Shyris N34-120 y Portugal"
                  value={shippingStreet}
                  onChange={(e) => setShippingStreet(e.target.value)}
                  className="mt-1 w-full border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-xs uppercase text-muted">
                  Referencia / Edificio / Urbanización
                </label>
                <input
                  type="text"
                  placeholder="Ej. Urbanización La Primavera, Casa 14 (Frente al parque)"
                  value={shippingReference}
                  onChange={(e) => setShippingReference(e.target.value)}
                  className="mt-1 w-full border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA (5 cols): RESUMEN FINANCIERO Y PAGO */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 border border-border bg-surface p-6">
            <h2 className="font-serif text-2xl font-normal text-foreground">
              Resumen de tu Orden
            </h2>

            <div className="mt-4 divide-y divide-border border-y border-border">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-start justify-between py-3.5 text-xs"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {item.quantity}x {item.name}
                    </p>
                    <p className="font-mono text-[11px] text-muted">
                      {item.customConfiguration.sizeLabel}
                    </p>
                    <span className="font-mono text-[10px] text-accent">
                      {item.isMadeToOrder
                        ? `Bajo pedido (${item.estimatedLeadTimeDays}d)`
                        : "En Stock Inmediato"}
                    </span>
                  </div>
                  <span className="font-mono font-medium text-foreground">
                    ${(item.unitPriceUsd * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Desglose Dinámico Calculado por el Servidor */}
            {quote && (
              <div className="mt-5 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-mono text-foreground">
                    ${quote.subtotalUsd.toFixed(2)} USD
                  </span>
                </div>

                <div className="flex justify-between">
                  <div>
                    <span className="text-muted">
                      Logística y Envío ({shippingCanton})
                    </span>
                    <p className="font-mono text-[10px] text-accent">
                      Regla activa: {quote.explanationLabel}
                    </p>
                    <p className="font-mono text-[10px] text-muted">
                      Carga total: {quote.totalVolumeCubicMeters} m³ ·{" "}
                      {quote.totalWeightKg} kg
                    </p>
                  </div>
                  <span className="font-mono text-foreground">
                    {loadingQuote
                      ? "..."
                      : `$${quote.shippingCostUsd.toFixed(2)} USD`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted">
                    IVA Ecuador ({quote.ivaPercent}%)
                  </span>
                  <span className="font-mono text-foreground">
                    ${quote.ivaAmountUsd.toFixed(2)} USD
                  </span>
                </div>

                <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
                  <span className="font-serif text-xl">Total a Pagar</span>
                  <span className="font-mono text-xl text-accent">
                    ${quote.totalUsd.toFixed(2)} USD
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loadingQuote}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-foreground py-4 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-accent hover:text-white disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {submitting
                ? "Procesando Orden..."
                : `Confirmar y Pagar ${
                    quote ? `$${quote.totalUsd.toFixed(2)} USD` : ""
                  }`}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[11px] text-muted">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Transacción encriptada · Stripe Sandbox / Local DB</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}