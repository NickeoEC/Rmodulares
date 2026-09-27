import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { Package, Truck, ShieldCheck, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PerfilPedidosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // Buscamos los pedidos tanto por userId como por el correo electrónico del usuario
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        ...(session.user.email ? [{ billingEmail: session.user.email }] : []),
      ],
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Mi Cuenta RModulares · {session.user.role}
          </p>
          <h1 className="mt-1 font-serif text-4xl font-normal text-foreground">
            Hola, {session.user.name || session.user.email}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted">
            {session.user.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {session.user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 bg-foreground px-4 py-2 font-mono text-xs uppercase text-background"
            >
              <ShieldCheck className="h-4 w-4" />
              Ir al Panel Admin
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      {/* Historial de Pedidos */}
      <div className="mt-10 space-y-6">
        <h2 className="font-serif text-2xl font-normal">
          Mis Pedidos y Estado de Fabricación ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="border border-border bg-surface p-12 text-center">
            <Package className="mx-auto h-8 w-8 text-muted" />
            <p className="mt-3 font-serif text-2xl text-foreground">
              Aún no tienes pedidos registrados.
            </p>
            <Link
              href="/catalogo"
              className="mt-4 inline-block bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background"
            >
              Personalizar mi primer mueble en 3D
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="border border-border bg-surface p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="font-mono text-xs text-muted">
                    Orden N°{" "}
                    <strong className="text-foreground">
                      {order.orderNumber}
                    </strong>{" "}
                    ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("es-EC", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <p className="mt-1 text-xs text-muted">
                    Entrega en: {order.shippingCanton}, {order.shippingProvince}{" "}
                    ({order.shippingStreet})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs uppercase text-accent">
                    Estado: {order.status}
                  </span>
                  <Link
                    href={`/checkout/confirmacion/${order.id}`}
                    className="inline-flex items-center gap-1 font-mono text-xs uppercase text-foreground hover:text-accent"
                  >
                    Ver Recibo SRI
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="mt-4 divide-y divide-border">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 text-xs"
                  >
                    <div>
                      <p className="font-serif text-lg font-medium">
                        {item.quantity}x {item.productNameSnapshot}
                      </p>
                      <p className="font-mono text-[11px] text-muted">
                        {item.isMadeToOrder
                          ? `⏱ Fabricación a medida (${item.estimatedLeadTimeDays} días)`
                          : "⚡ Despacho de Stock Inmediato"}
                      </p>
                    </div>
                    <span className="font-mono font-medium">
                      ${(Number(item.unitPriceUsd) * item.quantity).toFixed(2)}{" "}
                      USD
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between border-t border-border pt-4 font-mono text-xs">
                <span className="text-muted">
                  Factura SRI ({order.billingIdType}: {order.billingIdNumber})
                </span>
                <span className="text-sm font-medium text-accent">
                  Total Pagado (Incl. IVA): ${Number(order.totalUsd).toFixed(2)}{" "}
                  USD
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}