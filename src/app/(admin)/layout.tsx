import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Truck,
  Box,
  Palette,
  ClipboardList,
  Warehouse,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Admin Completo */}
      <aside className="w-64 shrink-0 border-r border-border bg-surface p-6">
        <Link href="/" className="font-serif text-2xl font-medium">
          RMODULARES<span className="text-accent">.</span>
        </Link>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-accent">
          Panel Administrador
        </p>

        <nav className="mt-8 space-y-1.5 text-sm">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 font-medium transition hover:bg-background"
          >
            <LayoutDashboard className="h-4 w-4 text-accent" />
            Dashboard General
          </Link>
          <Link
            href="/admin/productos"
            className="flex items-center gap-3 px-3 py-2.5 font-medium transition hover:bg-background"
          >
            <Box className="h-4 w-4 text-accent" />
            Muebles & Modelos .GLB
          </Link>
          <Link
            href="/admin/materiales"
            className="flex items-center gap-3 px-3 py-2.5 font-medium transition hover:bg-background"
          >
            <Palette className="h-4 w-4 text-accent" />
            Materiales PBR 3D
          </Link>
          <Link
            href="/admin/inventario"
            className="flex items-center gap-3 px-3 py-2.5 font-medium transition hover:bg-background"
          >
            <Warehouse className="h-4 w-4 text-accent" />
            Stock SKU & Taller
          </Link>
          <Link
            href="/admin/pedidos"
            className="flex items-center gap-3 px-3 py-2.5 font-medium transition hover:bg-background"
          >
            <ClipboardList className="h-4 w-4 text-accent" />
            Pedidos & Facturas SRI
          </Link>
          <Link
            href="/admin/envios"
            className="flex items-center gap-3 px-3 py-2.5 font-medium transition hover:bg-background"
          >
            <Truck className="h-4 w-4 text-accent" />
            Motor de Envíos & IVA
          </Link>
          <Link
            href="/admin/lookbooks"
            className="flex items-center gap-3 px-3 py-2.5 font-medium transition hover:bg-background"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            Lookbooks & Hotspots
          </Link>
        </nav>

        <div className="mt-12 border-t border-border pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a la Tienda
          </Link>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}