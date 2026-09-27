"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotalUsd,
  } = useCartStore();

  if (!isOpen) return null;

  const subtotal = getSubtotalUsd();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="flex w-screen max-w-md flex-col justify-between border-l border-border bg-background text-foreground shadow-2xl">
          {/* Header del Drawer */}
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 className="font-serif text-2xl font-normal">Tu Selección</h2>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                Precios en USD · Envío calculado en Checkout
              </p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-2 text-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Lista de Ítems */}
          <div className="flex-1 divide-y divide-border overflow-y-auto px-6">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-serif text-xl text-muted">
                  Tu carrito está vacío.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-4 font-mono text-xs uppercase tracking-widest text-accent underline"
                >
                  Explorar el catálogo 3D
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 py-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-border bg-surface">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-serif text-lg font-medium">
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-muted hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="font-mono text-[11px] text-muted">
                        {item.customConfiguration.sizeLabel}
                      </p>

                      {Object.entries(item.customConfiguration.materials).map(
                        ([zone, matName]) => (
                          <p
                            key={zone}
                            className="font-mono text-[11px] text-muted"
                          >
                            {zone}: <span className="text-foreground">{matName}</span>
                          </p>
                        )
                      )}

                      <span className="mt-1 inline-block font-mono text-[10px] uppercase text-accent">
                        {item.isMadeToOrder
                          ? `⏱ Fabricación: ${item.estimatedLeadTimeDays} días`
                          : "⚡ En Stock (Entrega 48h)"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.quantity - 1)
                          }
                          className="px-2 py-1 text-muted hover:text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 font-mono text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.quantity + 1)
                          }
                          className="px-2 py-1 text-muted hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="font-mono text-sm font-medium">
                        ${(item.unitPriceUsd * item.quantity).toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer del Drawer */}
          {items.length > 0 && (
            <div className="border-t border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-muted">
                  Subtotal (Sin IVA)
                </span>
                <span className="font-mono text-xl font-medium">
                  ${subtotal.toFixed(2)} USD
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                El costo de envío (por Provincia, Monto o Volumen m³) y el IVA
                (15%) se calculan en el siguiente paso.
              </p>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 flex w-full items-center justify-center gap-2 bg-foreground py-4 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-accent hover:text-white"
              >
                Proceder al Checkout Ecuador
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}