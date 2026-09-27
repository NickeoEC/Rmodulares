"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  X,
  FileText,
  Truck,
  Hammer,
  CheckCircle2,
} from "lucide-react";

const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  PENDING_PAYMENT: {
    label: "Pendiente de Pago",
    badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  },
  PAID: {
    label: "Pagado (Por Procesar)",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  },
  IN_PRODUCTION: {
    label: "En Taller / Fabricación",
    badgeClass: "border-accent/50 bg-accent/15 text-accent",
  },
  READY_FOR_DISPATCH: {
    label: "Listo para Despacho",
    badgeClass: "border-blue-500/40 bg-blue-500/10 text-blue-600",
  },
  SHIPPED: {
    label: "En Ruta / Enviado",
    badgeClass: "border-indigo-500/40 bg-indigo-500/10 text-indigo-600",
  },
  DELIVERED: {
    label: "Entregado al Cliente",
    badgeClass: "border-emerald-700/40 bg-emerald-700/15 text-emerald-700 dark:text-emerald-300",
  },
  CANCELLED: {
    label: "Cancelado",
    badgeClass: "border-red-500/40 bg-red-500/10 text-red-600",
  },
};

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (data.orders) setOrders(data.orders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    setUpdatingId(null);

    if (res.ok && data.order) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.order : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(data.order);
      }
    } else {
      alert(data.error || "No se pudo cambiar el estado.");
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`¿Eliminar definitivamente la orden ${orderNumber}?`)) return;
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : o.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.billingName.toLowerCase().includes(q) ||
      o.billingIdNumber.toLowerCase().includes(q) ||
      o.shippingCanton.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Operaciones, Taller & Facturación SRI
        </p>
        <h1 className="mt-1 font-serif text-4xl font-normal">
          Gestión de Pedidos y Estados Logísticos
        </h1>
      </div>

      {/* Buscador y Filtros de Estado */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 font-mono text-xs uppercase transition ${
              statusFilter === "ALL"
                ? "bg-foreground text-background"
                : "border border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            Todos ({orders.length})
          </button>
          {Object.entries(ORDER_STATUS_CONFIG).map(([statusKey, cfg]) => (
            <button
              key={statusKey}
              type="button"
              onClick={() => setStatusFilter(statusKey)}
              className={`px-3 py-1.5 font-mono text-xs uppercase transition ${
                statusFilter === statusKey
                  ? "bg-foreground text-background"
                  : "border border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar RM-2026, Cédula/RUC o Cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-border bg-surface py-2 pl-9 pr-3 text-xs text-foreground focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="border border-border bg-surface p-6">
        {loading ? (
          <p className="py-12 text-center font-mono text-xs uppercase text-muted">
            Cargando órdenes...
          </p>
        ) : filteredOrders.length === 0 ? (
          <p className="py-12 text-center text-xs text-muted">
            No se encontraron pedidos con estos criterios.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border font-mono uppercase text-muted">
                  <th className="py-3 pr-4">N° Orden / Fecha</th>
                  <th className="py-3 pr-4">Facturación SRI</th>
                  <th className="py-3 pr-4">Destino / Envío</th>
                  <th className="py-3 pr-4">Piezas</th>
                  <th className="py-3 pr-4">Total USD</th>
                  <th className="py-3 pr-4">Cambiar Estado</th>
                  <th className="py-3 text-right">Ficha 3D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((o) => {
                  const statusCfg =
                    ORDER_STATUS_CONFIG[o.status] ||
                    ORDER_STATUS_CONFIG.PENDING_PAYMENT;
                  return (
                    <tr key={o.id}>
                      <td className="py-4 pr-4">
                        <p className="font-mono font-medium text-foreground">
                          {o.orderNumber}
                        </p>
                        <p className="font-mono text-[10px] text-muted">
                          {new Date(o.createdAt).toLocaleDateString("es-EC", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>

                      <td className="py-4 pr-4">
                        <p className="font-medium text-foreground">
                          {o.billingName}
                        </p>
                        <p className="font-mono text-[11px] text-muted">
                          {o.billingIdType}: {o.billingIdNumber}
                        </p>
                      </td>

                      <td className="py-4 pr-4">
                        <p className="text-foreground">
                          {o.shippingCanton}, {o.shippingProvince}
                        </p>
                        <p className="font-mono text-[10px] text-muted">
                          {o.appliedShippingStrategy} ($
                          {Number(o.shippingCostUsd).toFixed(2)})
                        </p>
                      </td>

                      <td className="py-4 pr-4 font-mono">
                        {o.items.length} ítem(s)
                      </td>

                      <td className="py-4 pr-4 font-mono font-medium text-foreground">
                        ${Number(o.totalUsd).toFixed(2)}
                      </td>

                      <td className="py-4 pr-4">
                        <select
                          disabled={updatingId === o.id}
                          value={o.status}
                          onChange={(e) =>
                            handleStatusChange(o.id, e.target.value)
                          }
                          className={`border px-2.5 py-1.5 font-mono text-[11px] uppercase focus:outline-none ${statusCfg.badgeClass}`}
                        >
                          {Object.entries(ORDER_STATUS_CONFIG).map(
                            ([k, v]) => (
                              <option
                                key={k}
                                value={k}
                                className="bg-background text-foreground"
                              >
                                {v.label}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td className="py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(o)}
                            className="inline-flex items-center gap-1 border border-border bg-background px-2.5 py-1.5 font-mono text-[11px] uppercase text-foreground hover:border-accent hover:text-accent"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver Taller
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteOrder(o.id, o.orderNumber)
                            }
                            className="border border-border bg-background p-1.5 text-muted hover:border-red-500 hover:text-red-500"
                            title="Eliminar orden"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETALLE DE ORDEN: FACTURA SRI Y ESPECIFICACIONES DE TALLER 3D */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl border border-border bg-background p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  Orden {selectedOrder.orderNumber} · Ficha de Producción y SRI
                </p>
                <h2 className="font-serif text-3xl font-normal">
                  Cliente: {selectedOrder.billingName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border border-border bg-surface p-4 text-xs">
                <h3 className="flex items-center gap-1.5 font-mono uppercase text-accent">
                  <FileText className="h-4 w-4" />
                  Datos Factura Electrónica (Ecuador)
                </h3>
                <p className="mt-2 font-medium">{selectedOrder.billingName}</p>
                <p className="font-mono text-muted">
                  {selectedOrder.billingIdType}: {selectedOrder.billingIdNumber}
                </p>
                <p className="mt-1 text-muted">
                  Correo: {selectedOrder.billingEmail}
                </p>
                <p className="text-muted">
                  Teléfono: {selectedOrder.billingPhone}
                </p>
                <p className="text-muted">
                  Dirección Fiscal: {selectedOrder.billingAddress}
                </p>
              </div>

              <div className="border border-border bg-surface p-4 text-xs">
                <h3 className="flex items-center gap-1.5 font-mono uppercase text-accent">
                  <Truck className="h-4 w-4" />
                  Guía de Remisión y Despacho
                </h3>
                <p className="mt-2 font-medium">
                  {selectedOrder.shippingCanton},{" "}
                  {selectedOrder.shippingProvince}
                </p>
                <p className="text-muted">{selectedOrder.shippingStreet}</p>
                {selectedOrder.shippingReference && (
                  <p className="mt-1 text-muted">
                    Ref: {selectedOrder.shippingReference}
                  </p>
                )}
                <p className="mt-2 font-mono text-[11px] text-accent">
                  Regla aplicada: {selectedOrder.appliedShippingStrategy}
                </p>
              </div>
            </div>

            {/* Especificaciones 3D de cada Mueble para el Taller */}
            <div className="mt-6">
              <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground">
                <Hammer className="h-4 w-4 text-accent" />
                Especificaciones de Configuración 3D por Pieza
              </h3>

              <div className="mt-3 space-y-3">
                {selectedOrder.items.map((item: any) => {
                  const cfg = item.customConfiguration || {};
                  const mats = cfg.materials || {};
                  return (
                    <div
                      key={item.id}
                      className="border border-border bg-surface p-4 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-serif text-lg font-medium text-foreground">
                          {item.quantity}x {item.productNameSnapshot}
                        </p>
                        <span className="font-mono text-xs font-medium">
                          ${(Number(item.unitPriceUsd) * item.quantity).toFixed(2)}{" "}
                          USD
                        </span>
                      </div>

                      <p className="mt-1 font-mono text-xs text-accent">
                        Módulo / Tamaño: {cfg.sizeLabel || "Estándar"} ·{" "}
                        {item.isMadeToOrder
                          ? `Fabricación a medida (${item.estimatedLeadTimeDays} días)`
                          : "Despacho de Stock SKU"}
                      </p>

                      {Object.keys(mats).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
                          {Object.entries(mats).map(([zone, matName]) => (
                            <span
                              key={zone}
                              className="border border-border bg-background px-2.5 py-1 font-mono text-[11px]"
                            >
                              {zone}: <strong>{String(matName)}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totales y Cambio Rápido de Estado */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase text-muted">
                  Estado actual:
                </span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value)
                  }
                  className="border border-border bg-surface px-3 py-2 font-mono text-xs uppercase"
                >
                  {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-right font-mono text-xs">
                <p className="text-muted">
                  Subtotal: ${Number(selectedOrder.subtotalUsd).toFixed(2)} |
                  Envío: ${Number(selectedOrder.shippingCostUsd).toFixed(2)} |
                  IVA ({Number(selectedOrder.ivaPercentApplied)}%): $
                  {Number(selectedOrder.ivaAmountUsd).toFixed(2)}
                </p>
                <p className="mt-1 text-base font-medium text-accent">
                  Total Facturado: ${Number(selectedOrder.totalUsd).toFixed(2)}{" "}
                  USD
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}