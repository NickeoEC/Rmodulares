import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowRight, FileText, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="border border-border bg-surface p-8 sm:p-12">
        <div className="inline-flex items-center gap-2 border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs uppercase text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          Orden Confirmada · {order.orderNumber}
        </div>

        <h1 className="mt-4 font-serif text-4xl font-normal text-foreground">
          Gracias por tu compra, {order.billingName}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Hemos registrado tu pedido y los datos para tu factura electrónica en
          Ecuador ({order.billingIdType}: {order.billingIdNumber}).
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 border-y border-border py-6 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 font-mono text-xs uppercase text-muted">
              <FileText className="h-3.5 w-3.5 text-accent" />
              Facturación Electrónica
            </p>
            <p className="mt-1 text-sm font-medium">{order.billingName}</p>
            <p className="font-mono text-xs text-muted">
              {order.billingIdType}: {order.billingIdNumber}
            </p>
            <p className="text-xs text-muted">{order.billingEmail}</p>
          </div>

          <div>
            <p className="flex items-center gap-1.5 font-mono text-xs uppercase text-muted">
              <Truck className="h-3.5 w-3.5 text-accent" />
              Destino Logístico
            </p>
            <p className="mt-1 text-sm font-medium">
              {order.shippingCanton}, {order.shippingProvince}
            </p>
            <p className="text-xs text-muted">{order.shippingStreet}</p>
            <p className="mt-1 font-mono text-[11px] text-accent">
              Estrategia aplicada: {order.appliedShippingStrategy}
            </p>
          </div>
        </div>

        {/* Detalle de Piezas */}
        <div className="mt-6 space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Piezas Adquiridas
          </h2>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border border-border bg-background p-3.5 text-xs"
            >
              <div>
                <p className="font-medium text-foreground">
                  {item.quantity}x {item.productNameSnapshot}
                </p>
                <p className="font-mono text-[11px] text-muted">
                  {item.isMadeToOrder
                    ? `Fabricación a medida (${item.estimatedLeadTimeDays} días)`
                    : "Despacho de Stock Inmediato"}
                </p>
              </div>
              <span className="font-mono font-medium">
                ${(Number(item.unitPriceUsd) * item.quantity).toFixed(2)} USD
              </span>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="mt-6 space-y-1.5 border-t border-border pt-4 text-right font-mono text-xs">
          <p className="text-muted">
            Subtotal: ${Number(order.subtotalUsd).toFixed(2)} USD
          </p>
          <p className="text-muted">
            Envío: ${Number(order.shippingCostUsd).toFixed(2)} USD
          </p>
          <p className="text-muted">
            IVA ({Number(order.ivaPercentApplied)}%): $
            {Number(order.ivaAmountUsd).toFixed(2)} USD
          </p>
          <p className="pt-2 text-lg font-medium text-foreground">
            Total Pagado: ${Number(order.totalUsd).toFixed(2)} USD
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-4">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background"
          >
            Seguir Explorando
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}