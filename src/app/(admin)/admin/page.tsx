import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Truck, Package, DollarSign, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [orders, productsCount, storeSettings, lowStockSkus] =
    await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: true },
      }),
      prisma.product.count(),
      prisma.storeSettings.findUnique({ where: { id: "global_settings" } }),
      prisma.productVariantSku.findMany({
        where: { stockQuantity: { lte: 5 } },
        include: { product: true },
      }),
    ]);

  const totalRevenueUsd = orders.reduce(
    (acc, o) => acc + Number(o.totalUsd),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Administración General
          </p>
          <h1 className="mt-1 font-serif text-4xl font-normal">
            Centro de Control RModulares
          </h1>
        </div>

        <Link
          href="/admin/envios"
          className="inline-flex items-center gap-2 bg-foreground px-5 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-accent hover:text-white"
        >
          <Truck className="h-4 w-4" />
          Configurar Regla de Envío ({storeSettings?.activeShippingStrategy})
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="border border-border bg-surface p-5">
          <span className="font-mono text-xs uppercase text-muted">
            Ventas Registradas
          </span>
          <p className="mt-2 font-mono text-2xl font-medium text-foreground">
            ${totalRevenueUsd.toFixed(2)} USD
          </p>
        </div>

        <div className="border border-border bg-surface p-5">
          <span className="font-mono text-xs uppercase text-muted">
            Órdenes Totales
          </span>
          <p className="mt-2 font-mono text-2xl font-medium text-foreground">
            {orders.length}
          </p>
        </div>

        <div className="border border-border bg-surface p-5">
          <span className="font-mono text-xs uppercase text-muted">
            Muebles en Catálogo
          </span>
          <p className="mt-2 font-mono text-2xl font-medium text-foreground">
            {productsCount}
          </p>
        </div>

        <div className="border border-border bg-surface p-5">
          <span className="font-mono text-xs uppercase text-muted">
            Regla de Envío Activa
          </span>
          <p className="mt-2 font-mono text-sm font-medium text-accent">
            {storeSettings?.activeShippingStrategy || "FLAT_BY_LOCATION"}
          </p>
        </div>
      </div>

      {/* Tabla de Últimos Pedidos con Datos de Facturación Ecuador */}
      <div className="border border-border bg-surface p-6">
        <h2 className="font-serif text-2xl font-normal">
          Últimos Pedidos y Facturación SRI
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border font-mono uppercase text-muted">
                <th className="py-3 pr-4">Orden</th>
                <th className="py-3 pr-4">Cliente & ID Fiscal</th>
                <th className="py-3 pr-4">Destino</th>
                <th className="py-3 pr-4">Regla Envío</th>
                <th className="py-3 pr-4">Estado</th>
                <th className="py-3 text-right">Total USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    Aún no hay órdenes registradas. Realiza una compra de prueba
                    en /checkout.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3.5 pr-4 font-mono font-medium">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="font-medium">{o.billingName}</p>
                      <p className="font-mono text-[11px] text-muted">
                        {o.billingIdType}: {o.billingIdNumber}
                      </p>
                    </td>
                    <td className="py-3.5 pr-4">
                      {o.shippingCanton}, {o.shippingProvince}
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-[11px]">
                      {o.appliedShippingStrategy} ($
                      {Number(o.shippingCostUsd).toFixed(2)})
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase text-accent">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono font-medium">
                      ${Number(o.totalUsd).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Control de Stock de Variantes SKU */}
      <div className="border border-border bg-surface p-6">
        <h2 className="font-serif text-2xl font-normal">
          Inventario Físico por SKU (Entrega Inmediata)
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {lowStockSkus.map((sku) => (
            <div
              key={sku.id}
              className="flex items-center justify-between border border-border bg-background p-4"
            >
              <div>
                <p className="font-medium">{sku.product.name}</p>
                <p className="font-mono text-xs text-muted">SKU: {sku.sku}</p>
              </div>
              <span className="font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Stock: {sku.stockQuantity} unidades
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}