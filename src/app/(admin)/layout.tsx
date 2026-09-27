import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Truck,
  Package,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Admin */}
      <aside className="w-64 shrink-0 border-r border-border bg-surface p-6">
        <Link href="/" className="font-serif text-2xl font-medium">
          RMODULARES<span className="text-accent">.</span>
        </Link>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-accent">
          Panel Administrador
        </p>

        <nav className="mt-8 space-y-2 text-sm">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 font-medium transition hover:bg-background"
          >
            <LayoutDashboard className="h-4 w-4 text-accent" />
            Dashboard & Pedidos
          </Link>
          <Link
            href="/admin/envios"
            className="flex items-center gap-3 px-3 py-2.5 font-medium transition hover:bg-background"
          >
            <Truck className="h-4 w-4 text-accent" />
            Motor de Envíos & IVA
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